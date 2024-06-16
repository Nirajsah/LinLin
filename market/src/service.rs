#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use self::state::Market;
use async_graphql::{EmptySubscription, Request, Response, Schema};
use linera_sdk::{
    base::WithServiceAbi,
    graphql::GraphQLMutationRoot,
    views::{View, ViewStorageContext},
    Service, ServiceRuntime,
};
use market::Operation;

pub struct MarketService {
    state: Arc<Market>,
}

linera_sdk::service!(MarketService);

impl WithServiceAbi for MarketService {
    type Abi = market::MarketAbi;
}

impl Service for MarketService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = Market::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        MarketService {
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
