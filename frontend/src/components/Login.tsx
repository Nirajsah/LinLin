import { useMutation } from '@apollo/client'
import { REQUEST_APPLICATION, SUBSCRIBE, USER_LOGIN } from '../GraphQL/queries'
import { useUser } from '../context/UserProvider'
import { APP, mainChainId } from '../constants/const'
import React from 'react'

export default function Login({ close }: { close: any }) {
  const { user, setUser } = useUser()
  const chainId = window.sessionStorage.getItem('chainId') ?? ''
  const owner = window.sessionStorage.getItem('owner') ?? ''
  const [userPort, setPort] = React.useState('')
  let [loginQuery] = useMutation(USER_LOGIN, {
    variables: {
      chainId: chainId,
      owner: owner,
      endpoint: 'auction-main',
    },
  })

  let [auctionSubscribeQuery] = useMutation(SUBSCRIBE, {
    variables: {
      endpoint: 'auction',
      chainId: chainId,
      port: userPort,
    },
  })
  let [requestAppQuery] = useMutation(REQUEST_APPLICATION)

  async function handleLogin() {
    await requestAppQuery({
      variables: {
        chainId: chainId,
        applicationId: APP.auction_id,
        targetChainId: mainChainId,
        endpoint: 'login',
        port: userPort,
      },
    })
    setTimeout(() => {
      loginQuery()
      auctionSubscribeQuery()
    }, 2000)
  }

  return (
    <div className="bg-gradient-to-tl from-slate-800 to-secondary-color flex-col w-[800px] p-10 h-fit flex justify-center items-center rounded-xl">
      <div className="text-8xl font-bold">LinLin</div>
      <div className="w-full flex flex-col">
        <form className="w-full gap-4 flex flex-col">
          <div className="w-full flex flex-col gap-1">
            <label>ChainId</label>
            <input
              type="text"
              name="chainId"
              id="chainId"
              onChange={(e) => {
                setUser({
                  ...user,
                  chainId: e.target.value,
                })
              }}
              placeholder="Enter Your ChainId"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label>Owner</label>
            <input
              type="text"
              name="owner"
              id="owner"
              onChange={(e) => {
                setUser({
                  ...user,
                  owner: e.target.value,
                })
              }}
              placeholder="Owner"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label>Port</label>
            <input
              type="text"
              name="port"
              id="port"
              onChange={(e) => {
                setPort(e.target.value)
                setUser({
                  ...user,
                  port: e.target.value,
                })
              }}
              placeholder="Port"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="self-end w-fit mt-5">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleLogin()
                close(false)
              }}
              className="bg-button-color text-lg rounded-md px-3 py-2 text-black"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
