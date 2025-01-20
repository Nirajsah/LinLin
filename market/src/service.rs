#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use self::state::Market;
use async_graphql::{EmptySubscription, Request, Response, Schema};
use linera_sdk::{
    base::WithServiceAbi, graphql::GraphQLMutationRoot, views::View, Service, ServiceRuntime,
};
use market::Operation;
use std::sync::{Arc, Mutex};


#[allow(dead_code)]
pub struct MarketService {
    state: Arc<Market>,
    runtime: Arc<Mutex<ServiceRuntime<Self>>>,
}

linera_sdk::service!(MarketService);

impl WithServiceAbi for MarketService {
    type Abi = market::MarketAbi;
}

impl Service for MarketService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = Market::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        MarketService {
            state: Arc::new(state),
            runtime: Arc::new(Mutex::new(runtime)),
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
