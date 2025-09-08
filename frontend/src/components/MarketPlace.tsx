import React from 'react'
import Modal from '../components/Modal'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { gql } from 'graphql-tag'
import { GET_MARKETPLACE, NEW_ITEM } from '../GraphQL/queries'
import { useUser } from '../context/UserProvider'

function Form({ handleFormClose }: { handleFormClose: () => void }) {
  const chainId = window.sessionStorage.getItem('chainId') ?? ''
  const [image, setImage] = React.useState('')
  const [type, setType] = React.useState('')
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isValidUrl, setIsValidUrl] = React.useState(true)

  const handleImageChange = (e: any) => {
    const url = e.target.value
    setImage(url)

    try {
      new URL(url)
      setIsValidUrl(true)
    } catch (_) {
      setIsValidUrl(false)
    }
  }

  let [newItem] = useMutation(NEW_ITEM)
  const handleQuery = async () => {
    try {
      const { data } = await newItem({
        variables: {
          name: name,
          description: description,
          image: image,
          type: type,
          endpoint: 'market',
          chainId: chainId,
        },
      })
      console.log('Mutation successful:', data)
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const isValidImageUrl =
    image &&
    (image.startsWith('/') ||
      image.startsWith('http://') ||
      image.startsWith('https://'))
  const handleOptionChange = (event: any) => {
    setType(event.target.value)
  }
  return (
    <div className="w-[800px] bg-gradient-to-tl from-slate-800 to-secondary-color rounded-2xl p-7 flex justify-between">
      <div className="w-full h-full max-w-[250px] max-h-[250px] bg-[#4c4e4d] rounded-2xl">
        {isValidImageUrl && image && (
          <img
            className="rounded-xl object-contain max-w-full max-h-full"
            src={image}
            alt="Item Image"
          />
        )}
      </div>
      <div className="flex flex-col w-full gap-4 max-w-[450px]">
        <div className="w-full flex flex-col">
          <label>Asset Name</label>
          <input
            type="text"
            placeholder="Item Name"
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            required
          />
        </div>
        <div className="w-full flex flex-col">
          <label>Asset Description</label>
          <input
            type="text"
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            required
          />
        </div>
        <div>
          <label>Asset Type</label>
          <select
            className="px-2 rounded-lg w-full py-1"
            value={type}
            required
            onChange={handleOptionChange}
          >
            <option value="">Select an option</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>
        </div>
        <div className="w-full flex flex-col">
          <label>Asset Image</label>
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={handleImageChange}
            required
            className={`px-3 py-2 font-thin rounded-lg outline-none w-full ${
              isValidUrl ? '' : 'border-red-500'
            }`}
          />
          {!isValidUrl && (
            <p className="text-red-500 mt-2">Please enter a valid image URL</p>
          )}
        </div>
        <div className="flex mt-4 w-fit gap-3 self-end">
          <button
            onClick={(e) => {
              e.preventDefault()
              handleFormClose()
            }}
            className="text-black text-sm w-fit bg-button-color grid place-content-center rounded-md px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleFormClose()
              handleQuery()
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

function Card({ item }: any) {
  return (
    <div className="border border-transparent hover:border-[#3b3c3e] w-[300px] h-fit gap-5 flex flex-col rounded-2xl p-3 bg-[#232429]">
      <div className="relative">
        <img
          src={item.image}
          className="rounded-xl"
          alt="Auction card image"
          loading="lazy"
        />
        <div className="absolute text-sm top-1 right-1 bg-green-600 px-5 py-2 rounded-lg">
          Owned
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full">
        <div className="w-full grid rounded-2xl p-4 h-fit gap-3 place-content-between bg-[#2f3035]">
          <div className="w-full">
            <div className="text-2xl">{item.name}</div>
            <div className="text-sm break-words whitespace-normal max-w-[250px] opacity-60">
              Owner: {item.owner.owner}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function MarketPlace() {
  const { user } = useUser()
  const [showForm, setShowForm] = React.useState(false)
  const chainId = window.sessionStorage.getItem('chainId') ?? user.chainId
  const [data, setData] = React.useState<any>([])
  function handleFormClose() {
    setShowForm(false)
  }
  let { refetch } = useQuery(GET_MARKETPLACE, {
    variables: {
      endpoint: 'market',
      chainId: chainId,
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setData(data?.items?.entries)
    },
  })

  useSubscription(
    gql`
      subscription Notifications($chainId: ID!) {
        notifications(chainId: $chainId)
      }
    `,
    {
      variables: {
        chainId: chainId,
      },
      onData: () => refetch(),
    }
  )
  return (
    <div className="flex text-white min-h-screen p-24">
      <div className="w-full flex flex-col">
        <div className="text-5xl text-white font-semibold">Market Place</div>
        <div className="py-10 gap-3 flex flex-wrap w-full">
          {data &&
            data.map((item: any, index: any) => (
              <div className="gap-4 grid grid-cols-4" key={index}>
                {item.value.map((val: any, index: any) => (
                  <div key={index}>
                    <Card item={val} />
                  </div>
                ))}
              </div>
            ))}
        </div>
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="fixed bottom-8 right-8 bg-white text-black px-4 py-2"
          >
            Add Asset
          </button>
        </div>
        <Modal select={showForm} unselect={handleFormClose}>
          <Form handleFormClose={handleFormClose} />
        </Modal>
      </div>
    </div>
  )
}
