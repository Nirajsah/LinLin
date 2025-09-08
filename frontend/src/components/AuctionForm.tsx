import React from 'react'
import { dateTimeToMilliseconds } from '../utils/time'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CREATE_AUCTION, GET_USER_ITEMS } from '../GraphQL/queries'
import { useUser } from '../context/UserProvider'

interface ItemType {
  id: number | undefined
  name: string | undefined
  description: string | undefined
  image: string | undefined
  type: string | undefined
}
export default function AuctionForm({ close }: { close: any }) {
  const chainId = window.sessionStorage.getItem('chainId') ?? ''
  const port = window.sessionStorage.getItem('port') ?? ''
  const owner = window.sessionStorage.getItem('owner') ?? ''
  const { user } = useUser()
  const [collections, setCollections] = React.useState<ItemType[]>([])
  const [date, setDate] = React.useState({
    startingDate: '',
    endDate: '',
  })
  const [time, setTime] = React.useState({
    startTime: '',
    endTime: '',
  })
  const startingTime = date.startingDate + ' ' + time.startTime
  const endTime = date.endDate + ' ' + time.endTime
  const auctionStartTime = dateTimeToMilliseconds(startingTime)
  const auctionEndTime = dateTimeToMilliseconds(endTime)

  const [startingBid, setStartingBid] = React.useState('')
  const [selectedCollection, setSelectedCollection] = React.useState<
    | {
        id: number
        name: string
        description: string
        image: string
        type: string
      }
    | any
  >(null)
  const [auction, setAuction] = React.useState<{
    id: number
    name: string
    description: string
    item: ItemType[]
    image: string
    startingBidAmount: string
    startingTime: number
    endingTime: number
  } | null>(null)

  let [newAuctoinQuery] = useMutation(CREATE_AUCTION)

  let [collectionQuery, { data: collectionData, called }] = useLazyQuery(
    GET_USER_ITEMS,
    {
      variables: {
        owner: owner,
        endpoint: 'market',
        chainId: chainId,
      },
    }
  )
  React.useEffect(() => {
    setTimeout(() => {
      if (!called && user.owner !== '') {
        collectionQuery()
      }
    }, 2000)

    setCollections(collectionData?.items?.entry?.value)
  }, [user, collectionData])

  function handleCollectionChange(e: any) {
    const selectedCollectionId = e.target.value
    collections.find((collection) => {
      if (collection.name === selectedCollectionId) {
        setSelectedCollection(collection)
      }
    })
  }

  React.useEffect(() => {
    setAuction({
      id: selectedCollection?.id as number,
      name: selectedCollection?.name as string,
      description: selectedCollection?.description as string,
      image: selectedCollection?.image as string,
      item: [
        {
          id: selectedCollection?.id,
          name: selectedCollection?.name,
          description: selectedCollection?.description,
          type: selectedCollection?.type,
          image: selectedCollection?.image,
        },
      ],
      startingBidAmount: startingBid,
      startingTime: auctionStartTime,
      endingTime: auctionEndTime,
    })
  }, [selectedCollection, startingBid, date, time])

  async function auctionQuery() {
    await newAuctoinQuery({
      variables: {
        endpoint: 'auction',
        chainId: chainId,
        port: port,
        name: auction?.item[0].name,
        item: auction?.item[0],
        description: auction?.description,
        bidAmount: auction?.startingBidAmount,
        start: auction?.startingTime,
        end: auction?.endingTime,
        now: new Date().getTime(),
      },
    })
  }
  return (
    <div className="w-[800px] bg-gradient-to-tl from-slate-800 to-secondary-color rounded-2xl p-7 flex justify-between">
      <div className="w-full h-full max-w-[250px] max-h-[250px] bg-[#4c4e4d] rounded-2xl">
        {selectedCollection && selectedCollection.image && (
          <img
            className="rounded-xl object-contain max-w-full max-h-full"
            src={selectedCollection.image}
            alt="Item Image"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-col w-full gap-4 max-w-[450px]">
        <div className="w-full flex flex-col">
          <label>Item Name</label>
          <input
            type="text"
            placeholder="Item Name"
            readOnly
            disabled
            value={selectedCollection?.name || ''}
            className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
          />
        </div>
        <div className="w-full flex flex-col">
          <label>Item Description</label>
          <input
            type="text"
            placeholder="Description"
            readOnly
            disabled
            value={selectedCollection?.description || ''}
            className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
          />
        </div>
        <div>
          <label>Select Item</label>
          {collections ? (
            collections.length > 0 && (
              <select
                value={selectedCollection?.name}
                onChange={handleCollectionChange}
                className="px-2 rounded-lg w-full py-1"
              >
                <option value="">Select an option</option>
                {collections.map((collection, index) => (
                  <option key={index} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            )
          ) : (
            <div>No Items Found</div>
          )}
        </div>
        <div className="w-full flex flex-col">
          <label>Starting Bid Amount</label>
          <input
            type="text"
            placeholder="Starting Bid Amount"
            name="startingBidAmount"
            onChange={(e) => setStartingBid(e.target.value)}
            className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
          />
        </div>
        <div className="w-full gap-4 flex">
          <div className="flex w-full flex-col">
            <label>Starting Time</label>
            <input
              type="time"
              value={time.startTime}
              placeholder="Auction Starting Time"
              name="startingTime"
              onChange={(e) => {
                setTime((prevTime) => ({
                  ...prevTime,
                  startTime: e.target.value,
                }))
              }}
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>

          <div className="flex w-full flex-col">
            <label>Ending Time</label>
            <input
              type="time"
              value={time.endTime}
              placeholder="Auction Ending Time"
              name="endingTime"
              onChange={(e) => {
                setTime((prevTime) => ({
                  ...prevTime,
                  endTime: e.target.value,
                }))
              }}
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
        </div>
        <div className="w-full gap-4 flex">
          <div className="flex w-full flex-col">
            <label>Starting Date</label>
            <input
              type="date"
              value={date.startingDate}
              placeholder="Auction Starting Time"
              name="startingTime"
              onChange={(e) => {
                setDate((prevDate) => ({
                  ...prevDate,
                  startingDate: e.target.value,
                }))
              }}
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>

          <div className="flex w-full flex-col">
            <label>End Date</label>
            <input
              type="date"
              value={date.endDate}
              placeholder="Auction Ending Time"
              name="endingTime"
              onChange={(e) => {
                setDate((prevDate) => ({
                  ...prevDate,
                  endDate: e.target.value,
                }))
              }}
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
        </div>

        <div className="flex mt-4 w-fit gap-3 self-end">
          <button
            onClick={() => close()}
            className="text-black text-sm w-fit bg-button-color grid place-content-center rounded-md px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              auctionQuery()
              close()
            }}
            className="text-black text-sm w-fit bg-button-color grid place-content-center rounded-md px-3 py-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
