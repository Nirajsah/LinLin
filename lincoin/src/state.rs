// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use async_graphql::SimpleObject;
use linera_sdk::{
    abis::fungible::InitialState,
    base::{AccountOwner, Amount, Owner},
    views::{linera_views, MapView, RootView, ViewStorageContext},
};

#[derive(RootView, SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct LinCoin {
    pub accounts: MapView<AccountOwner, Amount>,
    pub owner: MapView<String, Owner>, // owner of main chain
}

#[allow(dead_code)]
impl LinCoin {
    pub(crate) async fn initialize_accounts(&mut self, state: InitialState) {
        for (k, v) in state.accounts {
            if v != Amount::ZERO {
                self.accounts
                    .insert(&k, v)
                    .expect("Error in insert statement");
            }

            log::info!("Initialized account {} with {} ", &k, &v);
        }
    }
    pub(crate) async fn balance(&self, account: &AccountOwner) -> Option<Amount> {
        log::info!("Retrieved balance for account {} ", &account);
        self.accounts
            .get(account)
            .await
            .expect("Failure in the retrieval")
    }

    pub(crate) async fn balance_or_default(&self, account: &AccountOwner) -> Amount {
        self.balance(account).await.unwrap_or_default()
    }

    pub(crate) async fn credit(&mut self, account: AccountOwner, amount: Amount) {
        if amount == Amount::ZERO {
            return;
        }
        let mut balance = self.balance_or_default(&account).await;
        balance.saturating_add_assign(amount);
        self.accounts
            .insert(&account, balance)
            .expect("Failed insert statement");
    }

    pub(crate) async fn debit(&mut self, account: AccountOwner, amount: Amount) {
        if amount == Amount::ZERO {
            return;
        }
        let mut balance = self.balance_or_default(&account).await;
        balance
            .try_sub_assign(amount)
            .expect("Source account does not have sufficient balance for transfer");
        if balance == Amount::ZERO {
            self.accounts
                .remove(&account)
                .expect("Failed to remove an empty account");
        } else {
            self.accounts
                .insert(&account, balance)
                .expect("Failed insertion operation");
        }
    }
}
