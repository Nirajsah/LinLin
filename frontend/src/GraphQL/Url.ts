import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client'
import { APP, mainChainId, mainPort } from '../constants/const'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

export const createApolloClient = () => {
  const host = 'localhost'
  const port = window.sessionStorage.getItem('port') ?? ''
  const chain_id = window.sessionStorage.getItem('chainId') ?? ''
  const wsLink = new GraphQLWsLink(
    createClient({
      url: `ws://${host}:${port}/ws`,
    })
  )
  const httpLink = createHttpLink({
    uri: (operation) => {
      const endpoint = operation.variables.endpoint
      const chainId = operation.variables.chainId ?? chain_id
      const portk = operation.variables.port ?? port
      switch (endpoint) {
        case 'lincoin':
          return `http://localhost:${port}/chains/${chainId}/applications/${APP.lincoin_id}`
        case 'auction':
          return `http://localhost:${portk}/chains/${chainId}/applications/${APP.auction_id}`
        case 'market':
          return `http://localhost:${port}/chains/${chainId}/applications/${APP.market_id}`
        case 'lincoin-main':
          return `http://localhost:${mainPort}/chains/${mainChainId}/applications/${APP.lincoin_id}`
        case 'auction-main':
          return `http://localhost:${mainPort}/chains/${mainChainId}/applications/${APP.auction_id}`
        case 'login':
          return `http://localhost:${portk}/`
        default:
          return `http://localhost:${port}`
      }
    },
  })
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          items: {
            merge(existing, incoming, { mergeObjects }) {
              // If there is no existing data, return the incoming data
              if (!existing) {
                return incoming
              }

              // If the incoming data is not an array, return the existing data
              if (!Array.isArray(incoming)) {
                return existing
              }

              // Merge the existing and incoming data based on a unique identifier
              const mergedItems = [...existing]
              incoming.forEach((item) => {
                const existingItemIndex = mergedItems.findIndex(
                  (i) => i.__typename === item.__typename && i.key === item.key
                )
                if (existingItemIndex === -1) {
                  mergedItems.push(item)
                } else {
                  mergedItems[existingItemIndex] = mergeObjects(
                    mergedItems[existingItemIndex],
                    item
                  )
                }
              })
              return mergedItems
            },
          },
        },
      },
    },
  })
  return new ApolloClient({
    link: splitLink,
    cache,
  })
}
