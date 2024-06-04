import React from 'react'
import ActiveAuctionCard from './ActiveAuctionCard'
import UpComingAuctionCard from './UpComingAuctionCard'
import Web3Button from './Web3Button'
import Auction from './Auction'

export default function Banner() {
  return (
    <div className="gap-3 flex flex-col items-center max-w-[1280px]">
      <div className="flex flex-col items-center">
        <div className="gap-7 grid grid-cols-3">
          <Auction />
          <Auction />
          <Auction />
        </div>
      </div>
      <div className="flex flex-col mt-10 items-center">
        <div className="text-4xl mb-10">OnGoing Auctions</div>
        <div className="gap-7 grid grid-cols-3">
          <ActiveAuctionCard />
          <ActiveAuctionCard />
          <ActiveAuctionCard />
        </div>
      </div>
      <div className="mt-14 flex flex-col items-center p-6">
        <div className="text-4xl mb-10">Up Coming Auctions</div>
        <div className="gap-5 grid grid-cols-3">
          <UpComingAuctionCard />
          <UpComingAuctionCard />
          <UpComingAuctionCard />
        </div>
      </div>
    </div>
  )
}
