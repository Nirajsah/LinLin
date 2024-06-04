import React from 'react'
import ProgressBar from './ProgressBar'
import Image from 'next/image'
export default function Auction() {
  return (
    <div className="w-[900px] h-fit rounded-2xl flex justify-between items-center p-12 bg-gradient-to-tl from-secondary-color">
      <div className="w-[300px] grid place-content-center border-[#7b7e82] h-[300px] border rounded-br-[40px] rounded-tl-[40px]">
        <Image
          src="https://assets.website-files.com/6332f870900a6035e7bf20b1/63330006193f9068a8fff0e0_633184cbf1fedd0aab3a7c80_webp.webp"
          alt="Nft"
          width={280}
          height={280}
          className="rounded-br-[34px] rounded-tl-[34px] rounded-md"
        />
      </div>
      <div className="flex w-fit h-full justify-between flex-col gap-8">
        <div className="self-start w-full max-w-[450px]">
          <div className="text-xl">Owner of the NFT</div>
          <div className="text-3xl font-semibold">Name of the NFT</div>
          <span className="flex items-center gap-2 my-2">
            Starting Bid: <p className="opacity-80 text-sm">100 LinCoin</p>
          </span>
          <span className="text-sm leading-tight text-gray-500">
            This is a beautiful piece of digital art created by a talented
            artist. It represents a unique and rare NFT (Non-Fungible Token)
            that holds value and authenticity on the blockchain. Own this NFT
            and become a part of the digital art revolution!
          </span>
          <span className="flex gap-2 items-center mt-3">
            Higest Bidder: <p>Bidder Address</p>
          </span>
          <ProgressBar duration={3800} />
        </div>
        <div className="w-fit self-end flex gap-5">
          <button className="bg-button-color text-black px-4 py-2 grid place-content-center">
            Place a Bid
          </button>
          <button className="bg-button-color text-black px-4 py-2 grid place-content-center">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
