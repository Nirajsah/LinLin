#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    base::{ChannelName, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use market::{MarketError, MarketResponse, Message, Operation};

use self::state::Market;

const MARKET: &[u8] = b"assets";

#[allow(dead_code)]
pub struct MarketContract {
    state: Market,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(MarketContract);

impl WithContractAbi for MarketContract {
    type Abi = market::MarketAbi;
}

impl Contract for MarketContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = Market::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");

        MarketContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::Subscribe => {
                self.on_op_subscribe().await.expect("Failed to subscribe");
                MarketResponse::Ok
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        let message_id = self
            .runtime
            .message_id()
            .expect("Message ID has to be available when executing a message");
        match message {
            Message::Subscribe => {
                self.runtime
                    .subscribe(message_id.chain_id, ChannelName::from(MARKET.to_vec()));
                log::info!("Subscribed to market channel {:?}", message_id.chain_id)
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl MarketContract {
    pub async fn on_op_subscribe(&mut self) -> Result<MarketResponse, MarketError> {
        self.runtime
            .prepare_message(Message::Subscribe)
            .with_authentication()
            .send_to(self.runtime.application_id().creation.chain_id);
        Ok(MarketResponse::Ok)
    }
}
