// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use lincoin::{LinResponse, Message, Operation};
use state::LinCoin;
use std::str::FromStr;

use linera_sdk::{
    abis::fungible::InitialState,
    base::{Account, AccountOwner, Amount, WithContractAbi},
    views::{RootView, View, ViewStorageContext},
    Contract, ContractRuntime,
};

pub struct LinCoinContract {
    state: LinCoin,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(LinCoinContract);

impl WithContractAbi for LinCoinContract {
    type Abi = lincoin::LinCoinAbi;
}

impl Contract for LinCoinContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = InitialState;

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = LinCoin::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        LinCoinContract { state, runtime }
    }

    async fn instantiate(&mut self, mut state: Self::InstantiationArgument) {
        let _ = self.runtime.application_parameters();

        if state.accounts.is_empty() {
            if let Some(owner) = self.runtime.authenticated_signer() {
                state.accounts.insert(
                    AccountOwner::User(owner),
                    Amount::from_str("50_000").unwrap(),
                );
            }
        }

        self.state.initialize_accounts(state).await;
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::Transfer { source, amount } => {
                let destination_account = Account {
                    owner: Some(
                        self.state
                            .owner
                            .get(&("main").to_string())
                            .await
                            .unwrap()
                            .unwrap(),
                    ),
                    chain_id: self.runtime.application_id().creation.chain_id,
                };
                self.check_account_authentication(source);
                self.state.debit(source, amount).await;
                self.finish_transfer_to_account(amount, destination_account, source)
                    .await;

                LinResponse::Ok
            }
            Operation::FundTransfer {
                amount,
                target_account,
            } => {
                let owner = self.runtime.authenticated_signer().unwrap();
                let source = AccountOwner::User(owner);
                let destination_account = Account {
                    owner: Some(target_account.owner.unwrap()),
                    chain_id: target_account.chain_id,
                };
                self.check_account_authentication(source);
                self.state.debit(source, amount).await;
                self.finish_transfer_to_account(amount, destination_account, source)
                    .await;
                LinResponse::Ok
            }
            Operation::Balance { owner } => {
                let balance = self.state.balance_or_default(&owner).await;
                log::info!("Balance of owner: {} is :{:?}", &owner, balance);
                LinResponse::Balance(balance)
            }
            _ => LinResponse::Ok,
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            Message::Credit {
                amount,
                target,
                source,
            } => {
                log::info!(
                    "Credit message received. source: {:?}, target: {:?}, amount: {:?}",
                    source,
                    target,
                    amount
                );
                let is_bouncing = self
                    .runtime
                    .message_is_bouncing()
                    .expect("Message delivery status has to be available when executing a message");
                let receiver = if is_bouncing { source } else { target };
                let owner = match source {
                    AccountOwner::User(owner) => owner,
                    _ => return,
                };
                self.state.owner.insert("main", owner).unwrap();
                self.state.credit(receiver, amount).await;
            }
            _ => (),
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl LinCoinContract {
    fn check_account_authentication(&mut self, owner: AccountOwner) {
        match owner {
            AccountOwner::User(address) => {
                assert_eq!(
                    self.runtime.authenticated_signer(),
                    Some(address),
                    "The requested transfer is not correctly authenticated."
                )
            }
            AccountOwner::Application(id) => {
                assert_eq!(
                    self.runtime.authenticated_caller_id(),
                    Some(id),
                    "The requested transfer is not correctly authenticated."
                )
            }
        }
    }
    async fn finish_transfer_to_account(
        &mut self,
        amount: Amount,
        target_account: Account,
        source: AccountOwner,
    ) {
        if target_account.chain_id == self.runtime.chain_id() {
            self.state
                .credit(AccountOwner::User(target_account.owner.unwrap()), amount)
                .await;
        } else {
            let message = Message::Credit {
                target: AccountOwner::User(target_account.owner.unwrap()),
                amount,
                source,
            };
            self.runtime
                .prepare_message(message)
                .with_authentication()
                .with_tracking()
                .send_to(target_account.chain_id);
        }
    }
}

#[async_graphql::ComplexObject]
impl LinCoin {}
