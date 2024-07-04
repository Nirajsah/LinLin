#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::str::FromStr;

use auction::{AuctionError, AuctionParameters, AuctionResponse, Message, OAuction, Operation};
use lincoin::LinCoinAbi;
use linera_sdk::{
    base::{
        Account, AccountOwner, Amount, ApplicationId, ChannelName, Destination, WithContractAbi,
    },
    views::{RootView, View, ViewStorageContext},
    Contract, ContractRuntime,
};
use market::MarketAbi;

use self::state::Auction;

const AUCTION: &[u8] = b"auctions";

#[allow(dead_code)]
pub struct AuctionContract {
    state: Auction,
    runtime: ContractRuntime<Self>,
}
linera_sdk::contract!(AuctionContract);

impl WithContractAbi for AuctionContract {
    type Abi = auction::AuctionAbi;
}

impl Contract for AuctionContract {
    type Message = Message;
    type Parameters = AuctionParameters;
    type InstantiationArgument = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = Auction::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        AuctionContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        self.runtime.application_parameters();
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::Subscribe => {
                self.on_op_subscribe().await.expect("Failed to subscribe");
                AuctionResponse::Ok
            }
            Operation::UpdateStatus { auction_id } => {
                log::info!("Update status called: {:?}", auction_id);
                if self.runtime.chain_id() == self.runtime.application_id().creation.chain_id {
                    self.on_op_auction_update(auction_id).await;
                }
                AuctionResponse::Ok
            }
            Operation::Bid {
                auction_id,
                amount,
                bidder,
            } => {
                log::info!("Bidder: {:?}", bidder);
                if self.runtime.chain_id() == bidder.chain_id {
                    if self.runtime.chain_id() == self.runtime.application_id().creation.chain_id {
                        self.on_bid_main(bidder, auction_id, amount).await;
                    } else {
                        self.on_op_bid(bidder, auction_id, amount).await;
                    }
                }
                AuctionResponse::Ok
            }
            Operation::Login { user } => {
                if user.chain_id != self.runtime.application_id().creation.chain_id {
                    self.user_login(user).await;
                }
                AuctionResponse::UserAdded
            }
            Operation::CreateAuction {
                name,
                item,
                description,
                start_time,
                end_time,
                starting_bid,
                now,
            } => {
                let owner = Account {
                    chain_id: self.runtime.chain_id(),
                    owner: Some(self.runtime.authenticated_signer().unwrap()),
                };
                let auction = self
                    .state
                    .new_auction(
                        name,
                        description,
                        item,
                        start_time,
                        end_time,
                        starting_bid,
                        now,
                        owner,
                    )
                    .await
                    .expect("Failed to create auction");

                self.on_op_send_auction(auction.clone())
                    .await
                    .expect("Failed to send auction");

                if self.runtime.chain_id() != self.runtime.application_id().creation.chain_id {
                    self.auction_charge(AccountOwner::User(
                        owner.owner.expect("owner error in create auction"),
                    ))
                    .await;
                }
                AuctionResponse::AuctionCreated
            }
        };
        AuctionResponse::Ok
    }

    async fn execute_message(&mut self, message: Message) {
        let message_id = self
            .runtime
            .message_id()
            .expect("Message ID has to be available when executing a message");
        match message {
            Message::Subscribe => {
                log::info!("Subscribed: {:?}", message_id.chain_id);
                self.runtime
                    .subscribe(message_id.chain_id, ChannelName::from(AUCTION.to_vec()))
            }
            Message::UpdateStatus { auction_id } => {
                log::info!("Update status received: {:?}", auction_id);
                if self.runtime.chain_id() != self.runtime.application_id().creation.chain_id {
                    self.state
                        .update_status(auction_id)
                        .await
                        .expect("failed to update status in msg");
                }
            }
            Message::Auction { auction } => {
                log::info!(
                    "Auction received: {:?} on chainId: {:?}",
                    auction,
                    self.runtime.chain_id()
                );
                self.receive_auction(auction).await;
            }
            Message::UpdateBid {
                auction_id,
                bidder,
                amount,
            } => {
                log::info!("Bid received: {:?}", amount);
                if self.runtime.chain_id() == self.runtime.application_id().creation.chain_id {
                    self.on_msg_bid(bidder, auction_id, amount).await;
                } else {
                    self.state
                        .update_bid(auction_id, amount, bidder)
                        .await
                        .expect("Failed to update bid");
                }
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

#[allow(dead_code)]
impl AuctionContract {
    fn lincoin_id(&mut self) -> ApplicationId<LinCoinAbi> {
        self.runtime.application_parameters().lincoin_app_id
    }
    fn market_id(&mut self) -> ApplicationId<MarketAbi> {
        self.runtime.application_parameters().market_app_id
    }

    pub async fn finalise_auction(&mut self, auction_id: u32) {
        let auction = match self.state.auctions.get(&auction_id).await.unwrap() {
            Some(auction) => auction,
            None => return,
        };

        match auction.status {
            auction::AuctionStatus::Ended => {
                let accounts = self.state.refund_reward(auction_id).await;
                for (account, amount) in accounts.iter() {
                    let reward_amount = Amount::from_str("30.").unwrap();
                    amount.saturating_add(reward_amount);
                    match auction.winner {
                        Some(winner) => {
                            if winner != *account {
                                self.fund_transfer(*account, *amount).await;
                            } else {
                                self.transfer_assest(auction.clone()).await;
                                self.fund_transfer(auction.item.owner, auction.current_bid)
                                    .await;
                            }
                        }
                        None => return,
                    };
                }
                log::info!("Finalising Auction: {:?}", auction);
            }
            _ => (),
        };
    }

    pub async fn user_login(&mut self, account: Account) {
        let lincoin_id = self.lincoin_id();
        let initial_amount = Amount::from_str("1000.").unwrap();
        let call = lincoin::Operation::FundTransfer {
            target_account: account,
            amount: initial_amount,
        };
        self.runtime.call_application(true, lincoin_id, &call);
    }

    pub async fn transfer_assest(&mut self, auction: OAuction) {
        let market_id = self.market_id();
        let item_owner = auction.item.owner.owner;
        match auction.winner {
            Some(winner) => {
                let owner = match item_owner {
                    Some(owner) => owner,
                    None => return,
                };

                let call = market::Operation::UpdateOwnerShip {
                    item_owner: owner,
                    id: auction.item.item_id,
                    new_owner: winner,
                };
                self.runtime.call_application(true, market_id, &call);
            }
            None => (),
        }
    }

    pub async fn on_op_auction_update(&mut self, auction_id: u32) {
        self.state
            .update_status(auction_id)
            .await
            .expect("failed to update auction status");
        let dest = Destination::Subscribers(ChannelName::from(AUCTION.to_vec()));
        self.runtime
            .prepare_message(Message::UpdateStatus { auction_id })
            .with_authentication()
            .send_to(dest);

        self.finalise_auction(auction_id).await;
    }

    pub async fn on_msg_bid(&mut self, bidder: Account, auction_id: u32, bid: Amount) {
        let user = match bidder.owner {
            Some(owner) => AccountOwner::User(owner),
            _ => return,
        }; // Operation Transfer requires type AccountOwner instead of Account

        self.state
            .update_bid(auction_id, bid, bidder)
            .await
            .expect("Failed to update bid");

        self.state.bidder(auction_id, bidder.clone(), bid).await;
        let call = lincoin::Operation::Transfer {
            source: user,
            amount: bid,
        };
        let lincoin_id = self.lincoin_id();
        self.runtime.call_application(true, lincoin_id, &call);
    }

    pub async fn on_bid_main(&mut self, bidder: Account, auction_id: u32, bid: Amount) {
        let user = match bidder.owner {
            Some(owner) => AccountOwner::User(owner),
            _ => return,
        }; // Operation Transfer requires type AccountOwner instead of Account

        self.state
            .update_bid(auction_id, bid, bidder)
            .await
            .expect("Failed to update bid");

        let dest = Destination::Subscribers(ChannelName::from(AUCTION.to_vec()));
        self.runtime
            .prepare_message(Message::UpdateBid {
                auction_id,
                amount: bid,
                bidder,
            })
            .with_authentication()
            .send_to(dest);

        self.state.bidder(auction_id, bidder, bid).await;
        let call = lincoin::Operation::Transfer {
            source: user,
            amount: bid,
        };

        let lincoin_id = self.lincoin_id();
        self.runtime.call_application(true, lincoin_id, &call);
    }

    pub async fn on_op_bid(&mut self, bidder: Account, auction_id: u32, bid: Amount) {
        self.state
            .update_bid(auction_id, bid, bidder)
            .await
            .expect("Failed to update bid");

        let dest = Destination::Subscribers(ChannelName::from(AUCTION.to_vec()));
        self.runtime
            .prepare_message(Message::UpdateBid {
                auction_id,
                amount: bid,
                bidder,
            })
            .with_authentication()
            .send_to(dest);

        let dest_chain_id = self.runtime.application_id().creation.chain_id;
        self.runtime
            .prepare_message(Message::UpdateBid {
                auction_id,
                bidder,
                amount: bid,
            })
            .with_authentication()
            .send_to(dest_chain_id);
    }

    pub async fn on_op_subscribe(&mut self) -> Result<AuctionResponse, AuctionError> {
        let market_id = self.market_id();
        self.runtime
            .prepare_message(Message::Subscribe) // subscribing to current application
            .with_authentication()
            .send_to(self.runtime.application_id().creation.chain_id);

        log::info!("calling from {:?}", self.runtime.chain_id());
        let call = market::Operation::Subscribe;
        self.runtime.call_application(true, market_id, &call); // subscribing to different application

        Ok(AuctionResponse::Ok)
    }

    pub async fn fund_transfer(&mut self, user: Account, amount: Amount) {
        let call = lincoin::Operation::FundTransfer {
            target_account: user,
            amount,
        };
        let lincoin_id = self.lincoin_id();
        self.runtime.call_application(true, lincoin_id, &call);
    }

    pub async fn auction_charge(&mut self, user: AccountOwner) {
        let amount = Amount::from_str("250.").unwrap();
        let call = lincoin::Operation::Transfer {
            source: user,
            amount,
        };

        let lincoin_id = self.lincoin_id();
        self.runtime.call_application(true, lincoin_id, &call);
    }
    pub async fn on_op_send_auction(&mut self, auction: OAuction) -> Result<(), AuctionError> {
        log::info!("Called from: {:?}", self.runtime.chain_id());
        log::info!(
            "Runtime ChainId: {:?} and Application ChainId: {:?} are same",
            self.runtime.chain_id(),
            self.runtime.application_id().creation.chain_id
        );

        // if self.runtime.chain_id() != self.runtime.application_id().creation.chain_id {
        //     let dest_chain_id = self.runtime.application_id().creation.chain_id;
        //     self.runtime
        //         .prepare_message(Message::Auction {
        //             auction: auction.clone(),
        //         })
        //         .with_tracking()
        //         .with_authentication()
        //         .send_to(dest_chain_id);
        //
        //     log::info!(
        //         "Sending Auction: {:?} to chaind: {:?}",
        //         auction,
        //         dest_chain_id
        //     );
        // }

        let dest = Destination::Subscribers(ChannelName::from(AUCTION.to_vec()));

        log::info!("Sending Auction: {:?} to chaind: {:?}", auction, dest);
        self.runtime
            .prepare_message(Message::Auction {
                auction: auction.clone(),
            })
            .with_authentication()
            .send_to(dest);

        Ok(())
    }

    pub async fn receive_auction(&mut self, auction: OAuction) {
        self.state
            .put_auctions(auction)
            .await
            .expect("failed to add auction");
    }
}
