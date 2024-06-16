// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]
#![allow(dead_code)]

mod state;

use std::sync::Arc;

use self::state::LinCoin;

use async_graphql::{EmptySubscription, Request, Response, Schema};
use lincoin::Operation;
use linera_sdk::graphql::GraphQLMutationRoot;
use linera_sdk::{
    base::WithServiceAbi,
    views::{View, ViewStorageContext},
    Service, ServiceRuntime,
};

#[derive(Clone)]
pub struct LinCoinService {
    state: Arc<LinCoin>,
}

linera_sdk::service!(LinCoinService);

impl WithServiceAbi for LinCoinService {
    type Abi = lincoin::LinCoinAbi;
}

impl Service for LinCoinService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = LinCoin::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        LinCoinService {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            self.state.clone(),
            Operation::mutation_root(),
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}
