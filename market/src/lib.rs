use async_graphql::{Request, Response};
use async_graphql_derive::SimpleObject;
use linera_sdk::{
    base::{Account, ArithmeticError, ContractAbi, Owner, ServiceAbi},
    graphql::GraphQLMutationRoot,
    views::ViewError,
};
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use thiserror::Error;

pub struct MarketAbi;

impl ContractAbi for MarketAbi {
    type Operation = Operation;
    type Response = MarketResponse;
}

impl ServiceAbi for MarketAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, Clone, GraphQLMutationRoot)]
pub enum Operation {
    Subscribe,
    NewItem {
        name: String,
        description: String,
        image: String,
        item_type: String,
    },
    GetItem {
        owner: Account,
    },
    UpdateOwnerShip {
        item_owner: Owner,
        id: u32,
        new_owner: Account,
    },
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Message {
    Ok,
    Subscribe,
    NewItem {
        item: Item,
    },
    UpdateOwnerShip {
        item_owner: Owner,
        id: u32,
        new_owner: Account,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Item {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub image: String,
    pub item_type: String,
    pub owner: Account,
}

#[derive(Debug, Deserialize, Serialize, Default)]
pub enum MarketResponse {
    #[default]
    Ok,
    Item(Vec<Item>),
    ItemAdded,
}

#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum MarketError {
    #[error("Item does not exist")]
    ItemNotFound,

    #[error("Item already exists for the owner")]
    ItemAlreadyExists,

    #[error(transparent)]
    ViewError(#[from] ViewError),

    #[error(transparent)]
    ArithmeticError(#[from] ArithmeticError),

    #[error(transparent)]
    Infallible(#[from] Infallible),

    #[error(transparent)]
    BcsError(#[from] bcs::Error),
}
