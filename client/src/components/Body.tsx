import React from 'react'
import ActiveAuctionCard from './ActiveAuctionCard'
import UpComingAuctionCard from './UpComingAuctionCard'
import PastAuction from './PastAuctions'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_AUCTION, UPDATE_STATUS } from '../GraphQL/queries'
import Auction from './Auction'
import Modal from './Modal'
import { mainChainId } from '../constants/const'

export interface OwnerType {
  chain_id: string
  owner: string
}

export interface ItemType {
  description: string
  image: string
  itemId: number
  name: string
  owner: OwnerType
}
export interface AuctionType {
  id: number
  name: string
  createdAt: number
  item: ItemType
  currentBid: string
  currentHighestBidder: OwnerType
  startTime: number
  startingBid: string
  endTime: number
  status: 'Ongoing' | 'Created' | 'Ended'
  winner: OwnerType
}

export default function Body() {
  const chainId = window.sessionStorage.getItem('chainId') ?? ''
  const [selectedAuction, setSelectedAuction] =
    React.useState<AuctionType | null>(null)

  const [update, setUpdate] = React.useState(false)
  const [activeAuctions, setActiveAuctions] = React.useState<AuctionType[]>([])
  const [upComingAuctions, setUpComingAuctions] = React.useState<AuctionType[]>(
    []
  )
  const [pastAuctions, setPastAuctions] = React.useState<AuctionType[]>([])

  const handleAuctionClick = (auction: AuctionType) => {
    setSelectedAuction(auction)
  }

  let [updateQuery] = useMutation(UPDATE_STATUS)

  let [auctionQuery, { data: auctionData, called: auctionCalled }] =
    useLazyQuery(GET_AUCTION, {
      variables: {
        chainId: chainId,
        endpoint: 'auction',
      },
    })

  if (!auctionCalled) {
    setTimeout(() => {
      auctionQuery()
    }, 1000)
  }

  React.useEffect(() => {
    function endAuctionUpdate() {
      console.log('active: ', activeAuctions)
      const currentTime = new Date().getTime()

      const remainingAuctions = activeAuctions.filter(
        (auction: AuctionType) => {
          if (auction.status === 'Ongoing' && auction.endTime > currentTime) {
            updateQuery({
              variables: {
                endpoint: 'auction-main',
                auctionId: auction.id,
              },
            })
            return false // Remove auction from activeAuctions
          }
          return true // Keep auction in activeAuctions
        }
      )

      setActiveAuctions(remainingAuctions)
      setUpdate(!update)
    }

    function startAuctionUpdate() {
      console.log('upcoming: ', upComingAuctions)
      const currentTime = new Date().getTime()

      const remainingAuctions = upComingAuctions.filter(
        (auction: AuctionType) => {
          if (auction.status === 'Created' && auction.startTime < currentTime) {
            updateQuery({
              variables: {
                endpoint: 'auction-main',
                auctionId: auction.id,
              },
            })
            return false // Remove auction from upComingAuctions
          }
          return true // Keep auction in upComingAuctions
        }
      )

      setUpComingAuctions(remainingAuctions)
      setUpdate(!update)
    }

    if (chainId === mainChainId) {
      const interval = setInterval(() => {
        console.log('calling...', new Date().getSeconds())
        startAuctionUpdate()
        endAuctionUpdate()
        setUpdate(!update)
        auctionQuery()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [activeAuctions, upComingAuctions])

  React.useEffect(() => {
    if (auctionData && auctionData?.auctions.entries) {
      const auctions = auctionData.auctions.entries
      const activeAuctionsData: AuctionType[] = []
      const upComingAuctionsData: AuctionType[] = []
      const pastAuctionsData: AuctionType[] = []

      auctions.forEach((auction: any) => {
        if (auction.value.status === 'Ongoing') {
          activeAuctionsData.push(auction.value)
        } else if (auction.value.status === 'Created') {
          upComingAuctionsData.push(auction.value)
        } else if (auction.value.status === 'Ended') {
          pastAuctionsData.push(auction.value)
        }
      })

      setActiveAuctions(activeAuctionsData)
      setUpComingAuctions(upComingAuctionsData)
      setPastAuctions(pastAuctionsData)
    }
  }, [auctionData, update])

  const handleCloseModal = () => {
    setSelectedAuction(null)
  }
  return (
    <div>
      {selectedAuction && (
        <div className="relative z-500">
          <Modal select={selectedAuction} unselect={handleCloseModal}>
            <Auction auction={selectedAuction} />
          </Modal>
        </div>
      )}
      <div className="gap-3 mt-10 flex flex-col items-center max-w-[1280px]">
        <div className="flex flex-col items-center">
          <div className="gap-5 grid grid-cols-3">
            {pastAuctions?.map((auction: AuctionType, index) => (
              <div key={index}>
                <PastAuction auction={auction} />
              </div>
            ))}
          </div>
        </div>
        {activeAuctions.length > 0 && (
          <div className="flex flex-col mt-10 items-center">
            <div className="text-4xl mb-10">OnGoing Auctions</div>
            <div className="gap-5 grid grid-cols-3">
              {activeAuctions?.map((auction: AuctionType, index) => (
                <button onClick={() => handleAuctionClick(auction)} key={index}>
                  <ActiveAuctionCard auction={auction} />
                </button>
              ))}
            </div>
          </div>
        )}

        {upComingAuctions.length > 0 && (
          <div className="mt-14 flex flex-col items-center p-6">
            <div className="text-4xl mb-10">Up Coming Auctions</div>
            <div className="gap-5 grid grid-cols-3">
              {upComingAuctions?.map((auction: AuctionType, index) => (
                <div key={index}>
                  <UpComingAuctionCard auction={auction} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
