#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use self::state::Auction;
use async_graphql::{EmptySubscription, Request, Response, Schema};
use auction::{AuctionParameters, Operation};
use linera_sdk::{
    base::WithServiceAbi,
    graphql::GraphQLMutationRoot,
    views::{View, ViewStorageContext},
    Service, ServiceRuntime,
};

#[derive(Clone)]
pub struct AuctionService {
    state: Arc<Auction>,
}

linera_sdk::service!(AuctionService);

impl WithServiceAbi for AuctionService {
    type Abi = auction::AuctionAbi;
}

impl Service for AuctionService {
    type Parameters = AuctionParameters;

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = Auction::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        AuctionService {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, query: Request) -> Response {
        let schema = Schema::build(
            self.state.clone(),
            Operation::mutation_root(),
            EmptySubscription,
        )
        .finish();
        schema.execute(query).await
    }
}
