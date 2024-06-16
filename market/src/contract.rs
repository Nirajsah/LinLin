#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    base::{Account, ChannelName, Destination, Owner, WithContractAbi},
    views::{RootView, View, ViewStorageContext},
    Contract, ContractRuntime,
};
use market::{Item, MarketError, MarketResponse, Message, Operation};

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
        let state = Market::load(ViewStorageContext::from(runtime.key_value_store()))
            .await
            .expect("Failed to load state");
        MarketContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {}

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::Subscribe => {
                self.on_op_subscribe().await.expect("Failed to subscribe");
                MarketResponse::Ok
            }
            Operation::NewItem {
                name,
                description,
                image,
                item_type,
            } => {
                let id = None;
                self.on_op_new(id, name, description, image, item_type)
                    .await
                    .expect("error adding item");
                MarketResponse::Ok
            }
            Operation::GetItem { owner } => {
                let owner = owner.owner.expect("Owner not found");
                let item = self.state.get_item(owner).await.unwrap();
                MarketResponse::Item(item)
            }
            Operation::UpdateOwnerShip {
                item_owner,
                id,
                new_owner,
            } => {
                self.on_op_ownership_update(item_owner, id, new_owner).await;
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
            Message::NewItem { item } => {
                self.on_msg_new(item).await.expect("Failed to add new item");
            }
            Message::UpdateOwnerShip {
                item_owner,
                id,
                new_owner,
            } => {
                self.state
                    .update_ownership(item_owner, id, new_owner)
                    .await
                    .expect("update failed on message");
            }
            _ => (),
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

    pub async fn on_op_ownership_update(&mut self, item_owner: Owner, id: u32, new_owner: Account) {
        self.state
            .update_ownership(item_owner.clone(), id.clone(), new_owner.clone())
            .await
            .expect("update failed");

        if self.runtime.chain_id() != self.runtime.application_id().creation.chain_id {
            log::info!("Sending ownership update to creation chain");
            self.runtime
                .prepare_message(Message::UpdateOwnerShip {
                    item_owner,
                    id,
                    new_owner,
                })
                .with_tracking()
                .with_authentication()
                .send_to(self.runtime.application_id().creation.chain_id);
        }
        let dest = Destination::Subscribers(ChannelName::from(MARKET.to_vec()));
        self.runtime
            .prepare_message(Message::UpdateOwnerShip {
                item_owner,
                id,
                new_owner,
            })
            .with_tracking()
            .with_authentication()
            .send_to(dest);
    }
    pub async fn on_op_new(
        &mut self,
        id: Option<u32>,
        name: String,
        description: String,
        image: String,
        item_type: String,
    ) -> Result<MarketResponse, MarketError> {
        let owner = Account {
            chain_id: self.runtime.chain_id(),
            owner: Some(self.runtime.authenticated_signer().unwrap()),
        };

        let item = self
            .state
            .new(id, name, description, image, owner, item_type)
            .await;

        if self.runtime.chain_id() != self.runtime.application_id().creation.chain_id {
            log::info!("Sending new item to creation chain");
            self.runtime
                .prepare_message(Message::NewItem { item: item.clone() })
                .with_tracking()
                .with_authentication()
                .send_to(self.runtime.application_id().creation.chain_id);
        }

        let dest = Destination::Subscribers(ChannelName::from(MARKET.to_vec()));
        log::info!("Sending new item to subscribers");
        self.runtime
            .prepare_message(Message::NewItem { item: item.clone() })
            .with_tracking()
            .with_authentication()
            .send_to(dest);

        Ok(MarketResponse::Ok)
    }
    pub async fn on_msg_new(&mut self, item: Item) -> Result<MarketResponse, MarketError> {
        let (id, name, description, image, owner, item_type) = (
            item.id,
            item.name,
            item.description,
            item.image,
            item.owner,
            item.item_type,
        );

        self.state
            .new(Some(id), name, description, image, owner, item_type)
            .await;

        Ok(MarketResponse::Ok)
    }
}
