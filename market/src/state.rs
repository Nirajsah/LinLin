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
        // let mut owner_items = match self.items.get_mut(&owner) {
        //     Some(items) => items,
        //     None => return Err(MarketError::ItemNotFound),
        // };
        //
        // let item_index = owner_items
        //     .iter()
        //     .position(|item| item.id == id)
        //     .ok_or(MarketError::ItemNotFound)?;
        //
        // let mut item_to_transfer = owner_items.remove(item_index);
        // item_to_transfer.owner = new_owner;
        //
        // let new_owner_items = self.items.entry(new_owner).or_insert_with(Vec::new);
        // new_owner_items.push(item_to_transfer);
        //
        // Ok(MarketResponse::Ok)
        let mut owner_items = match self.items.get(&owner).await? {
            Some(items) => items.clone(), // Clone the vector instead of taking a reference
            None => return Err(MarketError::ItemNotFound),
        };

        let mut new_owner_items = Vec::new(); // Create a new vector for the new owner

        for item in owner_items.iter_mut() {
            if item.id == id {
                item.owner = new_owner.clone(); // Update the owner of the existing item
            } else {
                new_owner_items.push(item.clone()); // Move the item to the new owner's vector
            }
        }

        // Remove the old owner's items
        let _ = self.items.remove(&owner);

        // Insert the new owner's items if they exist
        if let Some(new_owner) = &new_owner.owner {
            let _ = self.items.insert(new_owner, new_owner_items);
        }

        // let mut owner_items = match self.items.get(&owner).await? {
        //     Some(item) => item,
        //     None => return Err(MarketError::ItemNotFound),
        // };
        //
        // for i in 0..owner_items.len() {
        //     if owner_items[i].id == id {
        //         owner_items.remove(i); // Remove the item at index i
        //         let mut new_item = owner_items[i].clone(); // Create a new item by cloning the existing one
        //         new_item.owner = new_owner; // Update the owner of the new item
        //         owner_items.insert(i, new_item); // Insert the new item back into the vector
        //         break; // Exit the loop after making the change
        //     }
        // }
        // match new_owner.owner {
        //     Some(owner) => {
        //         let _ = self.items.insert(&owner, owner_items);
        //     }
        //     None => {
        //         return Err(MarketError::ItemNotFound);
        //     }
        // };
        // self.items.insert(&new_owner, item).unwrap();
        // for i in 0..item.len() {
        //     if item[i].id == id {
        //         item[i].owner = item[i].owner = new_owner;
        //         self.items.insert(&new_owner.owner.unwrap(), item).unwrap();
        //         return Ok(MarketResponse::Ok);
        //     }
        // }
        Ok(MarketResponse::Ok)
    }
}

pub fn generate_id(input: &str) -> u32 {
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish() as u32
}
