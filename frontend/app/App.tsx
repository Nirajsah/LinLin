import React from 'react'
import Banner from './components/Banner'
import About from './components/About'
import AuctionForm from './components/AuctionForm'
import Auction from './components/Auction'

export default function App() {
  return (
    <div className="w-full flex h-fit flex-col items-center py-24">
      <div className="text-[45px] lg:text-[85px] flex font-bold w-full items-center flex-wrap justify-center">
        <div className="text-center">Welcome to LinLin</div>
      </div>
      <div className="text-lg -mt-5 font-sans max-w-[800px] text-[#fff] text-center text-opacity-60">
        The decentralized auction platform built on Web3. Secure, transparent,
        and scalable auctions for digital and physical assets. Explore the
        future of auctions, today.
      </div>
      <Banner />
      <About />
      <AuctionForm />
      <Auction />
    </div>
  )
}
