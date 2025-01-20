use async_graphql::{InputObject, Request, Response};
use async_graphql_derive::SimpleObject;
use linera_sdk::{
    base::{AccountOwner, ArithmeticError, ContractAbi, ServiceAbi},
    graphql::GraphQLMutationRoot,
    views::ViewError,
    DataBlobHash,
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
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Message {
    Subscribe,
}

#[derive(
    Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Ord, PartialOrd, SimpleObject, InputObject,
)]
pub struct TokenId {
    pub id: Vec<u8> 
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject, InputObject)]
pub struct Nft {
    pub token_id: TokenId,
    pub minter: AccountOwner,
    pub owner: AccountOwner,
    pub meta_data: NftData,
    pub blob_hash: DataBlobHash,
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject, InputObject)]
pub struct NftData {
    pub name: String,
    pub description: String,
    pub image_url: String,
}

#[derive(Debug, Deserialize, Serialize, Default)]
pub enum MarketResponse {
    #[default]
    Ok,
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
