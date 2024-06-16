use async_graphql::SimpleObject;
use auction::{AuctionError, AuctionResponse, AuctionStatus, InputItem, Item, OAuction};
use linera_sdk::{
    base::{Account, AccountOwner, Amount, Timestamp},
    views::{linera_views, MapView, RootView, ViewStorageContext},
};
use std::{
    collections::HashMap,
    hash::{DefaultHasher, Hash, Hasher},
};

#[derive(RootView, SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct Auction {
    pub auctions: MapView<u32, OAuction>,
    pub bids: MapView<Account, Amount>,
    pub vault: MapView<AccountOwner, Amount>,
    pub bidders: MapView<u32, HashMap<Account, Amount>>,
}

#[allow(dead_code)]
impl Auction {
    pub async fn put_auctions(&mut self, auction: OAuction) -> Result<(), AuctionError> {
        let _ = self.auctions.insert(&auction.id, auction.clone());
        Ok(())
    }
    pub async fn bidder(&mut self, auction_id: u32, bidder: Account, amount: Amount) {
        let mut ac = HashMap::new();
        match self.bidders.get(&auction_id).await.unwrap() {
            Some(_) => {
                ac.insert(bidder, amount);
                self.bidders.insert(&auction_id, ac).unwrap();
            }
            None => {
                let mut bidders = HashMap::new();
                bidders.insert(bidder, amount);
                self.bidders.insert(&auction_id, bidders).unwrap();
            }
        }
    }
    pub async fn refund_reward(&mut self, auction_id: u32) -> HashMap<Account, Amount> {
        let mut bidders = HashMap::new();
        match self.bidders.get(&auction_id).await.unwrap() {
            Some(bidder) => {
                for (key, value) in bidder.iter() {
                    bidders.insert(*key, *value);
                }
            }
            None => (),
        }
        bidders
    }

    pub async fn get_auctions(&self) -> HashMap<u32, OAuction> {
        let mut auctions = HashMap::new();
        let _ = self
            .auctions
            .for_each_index_value(|u32, auction| {
                log::info!("Get_auction u32: {:?} and auction: {:?}", u32, auction);
                auctions.insert(u32, auction);
                Ok(())
            })
            .await;
        log::info!("Get_auction function: {:?}", auctions);
        auctions
    }

    pub async fn new_auction(
        &mut self,
        name: String,
        description: String,
        item: InputItem,
        start_time: Timestamp,
        end_time: Timestamp,
        starting_bid: Amount,
        now: Timestamp,
        owner: Account,
    ) -> Result<OAuction, AuctionError> {
        let id = generate_id(&name);
        if self.auctions.contains_key(&id).await? {
            return Err(AuctionError::AuctionAlreadyExists);
        }
        let item = Item {
            item_id: item.id,
            name: item.name,
            image: item.image,
            description: item.description,
            owner,
        };
        self.auctions.insert(
            &id,
            OAuction {
                id,
                name,
                description,
                item,
                start_time,
                end_time,
                status: AuctionStatus::Created,
                starting_bid,
                current_bid: starting_bid,
                current_highest_bidder: None,
                winner: None,
                created_at: now,
            },
        )?;

        let new_auction = self.auctions.get(&id).await.unwrap();
        Ok(new_auction.unwrap())
    }

    pub async fn update_status(&mut self, id: u32) -> Result<AuctionResponse, AuctionError> {
        let mut auction = match self.auctions.get(&id).await? {
            Some(auction) => auction,
            None => return Err(AuctionError::AuctionNotFound), // Auction not found, but not an error in this context
        };
        match auction.status {
            AuctionStatus::Created => {
                auction.status = AuctionStatus::Ongoing;
            }
            AuctionStatus::Ongoing => {
                let winner = match auction.current_highest_bidder {
                    Some(winner) => Some(winner),
                    _ => None,
                };
                auction.winner = match winner {
                    Some(winner) => Some(winner),
                    _ => None,
                };
                auction.status = AuctionStatus::Ended;
            }
            AuctionStatus::Ended => {
                return Err(AuctionError::AuctionEnded);
            }
            _ => (),
        };

        self.auctions.insert(&id, auction)?;
        Ok(AuctionResponse::Ok)
    }

    pub async fn get_auction(&self, id: u32) -> Result<AuctionResponse, AuctionError> {
        let auction = self.auctions.get(&id).await?;
        match auction {
            Some(auction) => Ok(AuctionResponse::Auction(auction)),
            None => Err(AuctionError::AuctionNotFound),
        }
    }

    pub async fn update_bid(
        &mut self,
        id: u32,
        bid: Amount,
        account: Account,
    ) -> Result<AuctionResponse, AuctionError> {
        if bid == Amount::ZERO {
            return Err(AuctionError::BidTooLow);
        }

        let mut auction = match self.auctions.get(&id).await? {
            Some(auction) => auction,
            None => return Err(AuctionError::AuctionNotFound),
        };

        if auction.status == AuctionStatus::Ended {
            return Err(AuctionError::AuctionEnded);
        }

        if auction.status != AuctionStatus::Ongoing {
            return Err(AuctionError::AuctionNotActive);
        }

        if bid <= auction.current_bid {
            return Err(AuctionError::BidTooLow);
        }

        auction.current_highest_bidder = Some(account);
        auction.current_bid = bid;
        self.auctions.insert(&id, auction)?;
        self.bids.insert(&account, bid)?;

        Ok(AuctionResponse::Ok)
    }
}

pub fn generate_id(input: &str) -> u32 {
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish() as u32
}
