use async_graphql::{scalar, InputObject, Request, Response, SimpleObject};
use lincoin::LinCoinAbi;
use market::MarketAbi;

use linera_sdk::base::{Account, ApplicationId};
use linera_sdk::bcs;
use linera_sdk::{
    base::{Amount, ArithmeticError, ContractAbi, ServiceAbi, Timestamp},
    graphql::GraphQLMutationRoot,
    views::ViewError,
};
use serde::{Deserialize, Serialize};

use std::convert::Infallible;
use thiserror::Error;

pub struct AuctionAbi;

impl ContractAbi for AuctionAbi {
    type Operation = Operation;
    type Response = AuctionResponse;
}

impl ServiceAbi for AuctionAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, Clone, GraphQLMutationRoot)]
pub enum Operation {
    Subscribe,
    CreateAuction {
        name: String,
        item: InputItem,
        description: String,
        start_time: Timestamp,
        end_time: Timestamp,
        starting_bid: Amount,
        now: Timestamp,
    },
    Bid {
        auction_id: u32,
        amount: Amount,
        bidder: Account,
    },
    UpdateStatus {
        auction_id: u32,
    },
    Login {
        user: Account,
    },
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Message {
    Auction {
        auction: OAuction,
    },
    Subscribe,
    UpdateBid {
        auction_id: u32,
        bidder: Account,
        amount: Amount,
    },
    UpdateStatus {
        auction_id: u32,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AuctionParameters {
    pub lincoin_app_id: ApplicationId<LinCoinAbi>,
    pub market_app_id: ApplicationId<MarketAbi>,
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Item {
    pub item_id: u32,
    pub image: String,
    pub name: String,
    pub description: String,
    pub owner: Account,
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct OAuction {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub status: AuctionStatus,
    pub item: Item,
    pub start_time: Timestamp,
    pub end_time: Timestamp,
    pub starting_bid: Amount,
    pub current_bid: Amount,
    pub current_highest_bidder: Option<Account>,
    pub winner: Option<Account>,
    pub created_at: Timestamp,
}

#[derive(Clone, Debug, Deserialize, Serialize, InputObject)]
pub struct InputItem {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub image: String,
}

scalar!(AuctionStatus);

#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize)]
pub enum AuctionStatus {
    #[default]
    Created,
    Ongoing,
    Ended,
    Canceled,
}

#[derive(Debug, Deserialize, Serialize, Default)]
pub enum AuctionResponse {
    #[default]
    Ok,
    Auction(OAuction),
    AuctionCreated,
    BidAccepted,
    StatusUpdated,
    UserAdded,
}

#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum AuctionError {
    #[error("Auction already exists")]
    AuctionAlreadyExists,

    #[error("Bid Amount is Low")]
    BidTooLow,

    #[error("Auction Not Found")]
    AuctionNotFound,

    #[error("Inactive Auction")]
    AuctionNotActive,

    #[error("Auction Ended")]
    AuctionEnded,

    #[error("Invalid Bid Amount")]
    InvalidBidAmount,

    #[error(transparent)]
    ViewError(#[from] ViewError),

    #[error(transparent)]
    ArithmeticError(#[from] ArithmeticError),

    #[error(transparent)]
    Infallible(#[from] Infallible),

    #[error(transparent)]
    BcsError(#[from] bcs::Error),
}
