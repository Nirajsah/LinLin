'use client'
import { useLazyQuery, gql } from '@apollo/client'
import React from 'react'

const GET_BALANCE = gql`
  query AccountByOwner($owner: String!) {
    accounts {
      entry(key: $owner) {
        value
      }
    }
  }
`
export default function Body() {
  let [
    balanceQuery,
    { data: balanceData, called: balanceCalled, error: balanceError },
  ] = useLazyQuery(GET_BALANCE, {
    variables: {
      owner:
        'User:fc5abfbf059175e4060fbe6e1e04ad5750b529f69f4f9654822865d4be8829b8',
    },
  })
  if (!balanceCalled) {
    void balanceQuery()
  }

  return (
    <>
      <div>Hello from NextJs</div>
      {balanceCalled && balanceError && <div>Error fetching balance</div>}
      {balanceCalled && !balanceError && (
        <div className="text-white">
          Balance: {balanceData?.accounts?.entry?.value ?? '0'}
          {/* {parseInt(balanceData.accounts.entry.value ?? '0').toLocaleString()} */}
        </div>
      )}
      {!balanceCalled && <div>Loading balance...</div>}
    </>
  )
}
