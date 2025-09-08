import { gql } from 'graphql-tag'

export const GET_BALANCE = gql`
  query UserBalance($owner: String!) {
    accounts {
      entry(key: $owner) {
        value
      }
    }
  }
`
export const NOTIFICATIONS = gql`
  subscription Notifications($chainId: ID!) {
    notifications(chainId: $chainId)
  }
`
export const USER_BID = gql`
  mutation Bid($auctionId: Int!, $amount: Int!, $bidder: Account!) {
    bid(auctionId: $auctionId, amount: $amount, bidder: $bidder)
  }
`
export const GET_ITEM = gql`
  query GetItem($owner: String!) {
    item(owner: $owner) {
      id
      name
      description
      image
      type
    }
  }
`

export const NEW_ITEM = gql`
  mutation NewItem(
    $name: String!
    $description: String!
    $image: String!
    $type: String!
  ) {
    newItem(
      name: $name
      description: $description
      image: $image
      itemType: $type
    )
  }
`

export const GET_USER_ITEMS = gql`
  query GetUserItems($owner: String!) {
    items {
      entry(key: $owner) {
        value {
          id
          name
          description
          image
        }
      }
    }
  }
`

export const GET_MARKETPLACE = gql`
  query GetMarketplace {
    items {
      entries {
        value {
          id
          name
          description
          image
          owner
        }
      }
    }
  }
`

export const REQUEST_APPLICATION = gql`
  mutation RequestApplication(
    $chainId: String!
    $applicationId: String!
    $targetChainId: String!
  ) {
    requestApplication(
      chainId: $chainId
      applicationId: $applicationId
      targetChainId: $targetChainId
    )
  }
`

export const USER_LOGIN = gql`
  mutation UserLogin($chainId: String!, $owner: String!) {
    login(user: { chain_id: $chainId, owner: $owner })
  }
`

export const UPDATE_STATUS = gql`
  mutation UpdateStatus($auctionId: String!) {
    updateStatus(auctionId: $auctionId)
  }
`

export const CREATE_AUCTION = gql`
  mutation NewAuction(
    $name: String!
    $description: String!
    $bidAmount: String!
    $start: Int!
    $end: Int!
    $item: InputItem!
    $now: Int!
  ) {
    createAuction(
      name: $name
      description: $description
      item: $item
      startTime: $start
      endTime: $end
      startingBid: $bidAmount
      now: $now
    )
  }
`

export const SUBSCRIBE = gql`
  mutation Subscribe {
    subscribe
  }
`

export const GET_AUCTION = gql`
  query GetAuctions {
    auctions {
      entries {
        value {
          id
          name
          createdAt
          item {
            name
            description
            itemId
            owner
            image
          }
          currentBid
          startingBid
          startTime
          endTime
          currentHighestBidder
          status
          winner
        }
      }
    }
  }
`
