use linera_sdk::{
    base::{Account, Owner},
    views::{linera_views, MapView, RootView, ViewStorageContext},
};
use market::{Item, MarketError, MarketResponse};
use std::hash::{DefaultHasher, Hash, Hasher};

#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct Market {
    pub items: MapView<Owner, Vec<Item>>,
}

#[allow(dead_code)]
impl Market {
    pub async fn new(
        &mut self,
        id: Option<u32>,
        name: String,
        description: String,
        image: String,
        owner: Account,
        item_type: String,
    ) -> Item {
        let mut store: Vec<Item> = Vec::new();
        let id = match id {
            Some(id) => id,
            None => generate_id(&name),
        };
        let item = Item {
            id,
            name,
            description,
            image,
            item_type,
            owner,
        };
        let owner = owner.owner.expect("Owner not found");
        let owner_item = self.items.get(&owner).await.unwrap();
        match owner_item {
            Some(mut items) => {
                for i in 0..items.len() {
                    if items[i].id == id {
                        return items[i].clone();
                    }
                }
                items.push(item.clone());
                log::info!("Item added to existing owner {:?}", items);
                self.items.insert(&owner, items).unwrap();
            }
            None => {
                store.push(item.clone());
                self.items.insert(&owner, store).unwrap();
            }
        }
        item
    }

    pub async fn get_item(&self, owner: Owner) -> Result<Vec<Item>, MarketError> {
        let item = self
            .items
            .get(&owner)
            .await
            .expect("Item might not exist")
            .unwrap();
        Ok(item)
    }

    pub async fn update_ownership(
        &mut self,
        owner: Owner,
        id: u32,
        new_owner: Account,
    ) -> Result<MarketResponse, MarketError> {
        let mut store: Vec<Item> = Vec::new();
        let mut owner_items = match self.items.get(&owner).await? {
            Some(item) => item,
            None => return Err(MarketError::ItemNotFound),
        };

        for i in 0..owner_items.len() {
            if owner_items[i].id == id {
                let mut item = owner_items.remove(i);
                item.owner = new_owner.clone();
                match self.items.get(&new_owner.owner.unwrap()).await? {
                    Some(mut items) => {
                        items.push(item.clone());
                        self.items.insert(&new_owner.owner.unwrap(), items).unwrap();
                    }
                    None => {
                        store.push(item.clone());
                        self.items
                            .insert(&new_owner.owner.unwrap(), store.clone())
                            .unwrap();
                    }
                }
            }
        }

        Ok(MarketResponse::Ok)
    }
}

pub fn generate_id(input: &str) -> u32 {
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish() as u32
}
