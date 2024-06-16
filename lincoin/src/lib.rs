use std::collections::BTreeMap;

use async_graphql::{Request, Response};
use linera_sdk::{
    abis::fungible::Account as FungibleAccount,
    base::{Account, AccountOwner, Amount, ContractAbi, ServiceAbi},
    graphql::GraphQLMutationRoot,
};

use serde::{Deserialize, Serialize};
pub struct LinCoinAbi;

impl ContractAbi for LinCoinAbi {
    type Operation = Operation;
    type Response = LinResponse;
}

impl ServiceAbi for LinCoinAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    Balance {
        owner: AccountOwner,
    },
    Transfer {
        source: AccountOwner,
        amount: Amount,
    },
    Claim {
        source: AccountOwner,
        amount: Amount,
        target_account: Account,
    },
    FundTransfer {
        target_account: Account,
        amount: Amount,
    },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstantiationArgument {
    pub accounts: BTreeMap<AccountOwner, Amount>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Message {
    Credit {
        target: AccountOwner,
        amount: Amount,
        source: AccountOwner,
    },

    Withdraw {
        owner: AccountOwner,
        amount: Amount,
        target_account: FungibleAccount,
    },
}

#[derive(Debug, Deserialize, Serialize, Default)]
pub enum LinResponse {
    #[default]
    Ok,
    Balance(Amount),
}
