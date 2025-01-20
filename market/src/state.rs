use linera_sdk::{
    base::AccountOwner,
    views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext},
};
use market::{Nft, TokenId};
use std::collections::BTreeSet;

#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct Market {
    pub nfts: MapView<TokenId, Nft>,
    pub owners: MapView<AccountOwner, BTreeSet<TokenId>>,
    pub num_minted_nfts: RegisterView<u64>
}

#[allow(dead_code)]
impl Market {} 