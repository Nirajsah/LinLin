import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { USER_BID } from '../GraphQL/queries'
import { AuctionType } from './Body'
import ProgressBar from './ProgressBar'
import { toast } from 'sonner'

export default function Auction({ auction }: { auction: AuctionType }) {
  const chainId = window.sessionStorage.getItem('chainId')
  const owner = window.sessionStorage.getItem('owner')
  const [inputField, setInputField] = useState(false)
  let [bidQuery] = useMutation(USER_BID)
  const [amount, setAmount] = React.useState('')
  function handleBid() {
    if (parseInt(auction.currentBid, 10) > parseInt(amount, 10)) {
      toast.error('Your bid must be higher than the current bid')
    } else {
      bidQuery({
        variables: {
          auctionId: auction.id,
          bidder: {
            chain_id: chainId,
            owner: owner,
          },
          amount: amount,
          endpoint: 'auction',
          chainId: chainId,
        },
      })
      toast.success('Bid Accepted')
    }
  }

  return (
    <div className="w-[900px] z-500 h-fit rounded-2xl flex justify-between items-center p-12 bg-gradient-to-tl from-slate-800 to-secondary-color">
      <div className="w-[300px] grid place-content-center border-[#7b7e82] h-[300px] border rounded-br-[40px] rounded-tl-[40px]">
        <img
          src={auction.item.image}
          alt={auction.item.name}
          className="rounded-br-[34px] rounded-tl-[34px] rounded-md"
        />
      </div>
      <div className="flex w-fit h-full justify-between flex-col gap-8">
        <div className="self-start w-full max-w-[450px]">
          <div className="text-sm text-truncate text-wrap text-ellipsis">
            Owner: {auction.item.owner.owner}
          </div>
          <div className="text-3xl mt-3 font-semibold">{auction.name}</div>
          <span className="flex items-center gap-2 my-2">
            Starting Bid:
            <p className="opacity-80 text-sm">{auction.startingBid} LinCoin</p>
          </span>
          <span className="text-sm leading-tight text-gray-500">
            This is a beautiful piece of digital art created by a talented
            artist. It represents a unique and rare NFT (Non-Fungible Token)
            that holds value and authenticity on the blockchain. Own this NFT
            and become a part of the digital art revolution!
          </span>
          <span className="flex flex-col gap-1 mt-3">
            Higest Bidder:
            <div className="break-words whitespace-normal">
              {auction.currentHighestBidder
                ? auction.currentHighestBidder.owner
                : 'None'}
            </div>
          </span>
          <span className="flex gap-2 break-words whitespace-normal items-center mt-3">
            Current Higest Bid: <p>{auction.currentBid}</p>
          </span>
          <ProgressBar duration={auction.endTime} />
        </div>
        <div className="w-fit self-end flex gap-5">
          {inputField && (
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-500 px-2"
            />
          )}
          {inputField ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                setInputField(!inputField)
                handleBid()
              }}
              className="bg-button-color text-black px-4 py-2 grid place-content-center"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={() => setInputField(!inputField)}
              className="bg-button-color text-black px-4 py-2 grid place-content-center"
            >
              Place a Bid
            </button>
          )}
          <button
            onClick={() => setInputField(false)}
            className="bg-button-color text-black px-4 py-2 grid place-content-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
