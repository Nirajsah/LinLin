import Image from 'next/image'
import React from 'react'
import CountDownCard from './CountDownCard'
import OnGoingStatus from './OnGoingStatus'

export default function AuctionCard() {
  return (
    <div className="border border-[#3b3c3e] w-[400px] h-fit gap-5 flex flex-col rounded-2xl p-3 bg-[#232429]">
      <div className="">
        <Image
          src="https://assets.website-files.com/6332f870900a6035e7bf20b1/63330006193f9068a8fff0e0_633184cbf1fedd0aab3a7c80_webp.webp"
          width={400}
          height={400}
          className="rounded-xl"
          alt="Auction card image"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-5">
        <div className="text-3xl">Name of the NFT</div>
        <div className="w-full grid grid-cols-3 rounded-2xl p-4 h-fit gap-3 place-content-between bg-[#2f3035]">
          <div className="gap-2 items-center">
            <div className="text-[#b1b2b5] text-sm">Starting Bid</div>
            <div>250 LinCoin</div>
          </div>

          <div className="place-self-center">
            <div className="text-[#b1b2b5] text-sm">Current Bid</div>
            <div>300 LinCoin</div>
          </div>
          <div className="place-self-center">
            <div className="text-[#b1b2b5] text-sm">Status</div>
            <div className="flex gap-1">
              <OnGoingStatus />
              OnGoing
            </div>
          </div>
          <div className="">
            <div className="text-[#b1b2b5] text-sm">Highest Bidder</div>
            <div>User Address</div>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-[#b1b2b5] text-sm">Start Date</div>
            <div className="text-lg">June 10, 2024</div>
          </div>
          <CountDownCard title={'Auction Ends In'} />
        </div>
      </div>
    </div>
  )
}
