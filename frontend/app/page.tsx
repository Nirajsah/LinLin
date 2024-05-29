'use client'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client'
import React from 'react'
import Body from './components/Body'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'

const link = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3000/ws',
  })
)
const httpLink = new HttpLink({
  uri: 'http://localhost:8080/chains/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65/applications/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65000000000000000000000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65020000000000000000000000',
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  link,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ApolloProvider client={client}>
        <Body />
      </ApolloProvider>
    </main>
  )
}
