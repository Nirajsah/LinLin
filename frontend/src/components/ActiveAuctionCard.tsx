import { convertMillisToDateTime } from '../utils/time'
import { AuctionType } from './Body'
import CountDownCard from './CountDownCard'
import OnGoingStatus from './OnGoingStatus'

export default function AuctionCard({ auction }: { auction: AuctionType }) {
  const { formattedDate } = convertMillisToDateTime(auction.startTime)

  return (
    <div className="border z-0 border-transparent hover:border-[#3b3c3e] w-[400px] h-fit gap-5 flex flex-col rounded-2xl p-3 bg-[#232429]">
      <div className="">
        <img
          src={auction.item.image}
          className="rounded-xl"
          alt="Auction card image"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-5">
        <div className="text-3xl self-start">{auction.name}</div>
        <div className="w-full grid grid-cols-3 rounded-2xl p-4 h-fit gap-3 place-content-between bg-[#2f3035]">
          <div className="gap-2">
            <div className="text-[#b1b2b5] text-start text-sm">
              Starting Bid
            </div>
            <div className="text-start">{auction.startingBid} LinCoin</div>
          </div>

          <div className="place-self-center">
            <div className="text-[#b1b2b5] text-sm">Current Bid</div>
            <div>{auction.currentBid} LinCoin</div>
          </div>
          <div className="place-self-center">
            <div className="text-[#b1b2b5] text-sm">Status</div>
            <div className="flex gap-1">
              <OnGoingStatus />
              OnGoing
            </div>
          </div>
          <div className="text-start w-[350px]">
            <div className="text-[#b1b2b5] text-sm">Highest Bidder</div>
            <div className="whitespace-normal break-words text-[#b1b2b5]">
              {auction.currentHighestBidder &&
              auction.currentHighestBidder.owner
                ? auction.currentHighestBidder.owner
                : ''}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-[#b1b2b5] text-start text-sm">Start Date</div>
            <div className="text-lg">{formattedDate}</div>
          </div>
          <CountDownCard
            title={'Auction Ends In'}
            auctionTimeInMilliseconds={auction.endTime}
          />
        </div>
      </div>
    </div>
  )
}
