import Image from 'next/image'
import React from 'react'
import OnGoingStatus from './OnGoingStatus'
import CountDownCard from './CountDownCard'

export default function Auction() {
  return (
    <div className="border border-transparent hover:border-[#3b3c3e] w-[300px] h-fit gap-5 flex flex-col rounded-2xl p-3 bg-[#232429]">
      <div className="relative">
        <Image
          src="https://assets.website-files.com/6332f870900a6035e7bf20b1/63330006193f9068a8fff0e0_633184cbf1fedd0aab3a7c80_webp.webp"
          width={300}
          height={300}
          className="rounded-xl"
          alt="Auction card image"
          loading="lazy"
        />
        <div className="absolute text-sm top-1 right-1 bg-green-600 px-5 py-2 rounded-lg">
          Sold
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="text-2xl">Name of the NFT</div>
        <div className="w-full grid grid-cols-2 rounded-2xl p-4 h-fit gap-3 place-content-between bg-[#2f3035]">
          <div className="gap-2 items-center">
            <div className="text-[#b1b2b5] text-sm">Sold At</div>
            <div>250 LinCoin</div>
          </div>
          <div>
            <div className="text-[#b1b2b5] text-sm">End Date</div>
            <div className="text-lg">June 10, 2024</div>
          </div>
        </div>
      </div>
    </div>
  )
}
