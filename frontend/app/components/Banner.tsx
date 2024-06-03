import React from 'react'
import ActiveAuctionCard from './ActiveAuctionCard'
import UpCommingAuctionCard from './UpCommingAuctionCard'

export default function Banner() {
  return (
    <div className="mt-24 gap-3 flex">
      <ActiveAuctionCard />
      <UpCommingAuctionCard />
    </div>
  )
}
