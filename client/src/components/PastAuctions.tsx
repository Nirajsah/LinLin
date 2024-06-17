import { convertMillisToDateTime } from '../utils/time'
import { AuctionType } from './Body'

export default function PastAuction({ auction }: { auction: AuctionType }) {
  const { formattedDate } = convertMillisToDateTime(auction.endTime)
  return (
    <div className="border border-transparent max-w-[300px] hover:border-[#3b3c3e] w-full h-full gap-5 flex flex-col rounded-2xl p-3 bg-[#232429]">
      <div className="relative w-full h-full">
        <div className="w-full h-full">
          <img
            src={auction.item.image}
            className="object-cover w-full h-full rounded-xl"
            alt="Auction card image"
            loading="lazy"
          />
        </div>
        <div className="absolute text-sm top-1 right-1 bg-green-600 px-5 py-2 rounded-lg">
          Sold
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-2xl">{auction.name}</div>
          {auction.winner && (
            <div className="text-sm break-words whitespace-normal opacity-60">
              Owner: {auction.winner.owner}
            </div>
          )}
        </div>
        <div className="w-full grid grid-cols-2 rounded-2xl p-4 h-fit gap-3 place-content-between bg-[#2f3035]">
          <div className="gap-2 items-center">
            <div className="text-[#b1b2b5] text-sm">Sold At</div>
            <div>{auction.currentBid} LinCoin</div>
          </div>
          <div>
            <div className="text-[#b1b2b5] text-sm">End Date</div>
            <div className="text-lg">{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
