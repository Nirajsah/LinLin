import React from 'react'
import Balance from './Balance'
import LoginButton from './LoginButton'
import AuctionButton from './AuctionButton'
import Modal from './Modal'
import Login from './Login'
import AuctionForm from './AuctionForm'
import { GET_BALANCE, NOTIFICATIONS } from '../GraphQL/queries'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { useUser } from '../context/UserProvider'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { user } = useUser()
  const chainId = window.sessionStorage.getItem('chainId') ?? ''
  const owner = window.sessionStorage.getItem('owner') ?? ''
  const [open, setOpen] = React.useState(false)
  const [hostModal, setHostModal] = React.useState(false)
  const [balanceQuery, { data: balanceData }] = useLazyQuery(GET_BALANCE, {
    variables: {
      owner: `User:${owner}`,
      endpoint: 'lincoin',
      chainId: chainId,
    },
  })

  useSubscription(NOTIFICATIONS, {
    variables: {
      chainId: chainId,
    },
    onData: () => balanceQuery(),
  })

  function handleClose() {
    setOpen(false)
  }
  function handleHostClose() {
    setHostModal(false)
  }

  return (
    <div className="relative z-50">
      <Modal select={open} unselect={handleClose}>
        <Login close={setOpen} />
      </Modal>
      <Modal select={hostModal} unselect={handleHostClose}>
        <AuctionForm close={handleHostClose} />
      </Modal>
      <div className="p-4 fixed w-full bg-transparent bg-opacity-95 backdrop-blur-xl flex justify-center">
        <div className="w-full flex justify-between items-center max-w-[1280px]">
          <Link to="/" className="text-4xl text-white font-bold">
            LinLin
          </Link>
          <div className="flex gap-5">
            <AuctionButton setHostModal={setHostModal} />
            {!user.isLoggedIn && <LoginButton setOpen={setOpen} />}
            {chainId && balanceData && <Balance balanceData={balanceData} />}
            <div className="drawer drawer-end w-fit h-fit">
              <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
              />
              <div className="drawer-content w-fit h-fit">
                <label htmlFor="my-drawer-4" className="cursor-pointer">
                  <div className="border rounded-xl p-3 border-[#3b3c3e]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.74064 11.963C3.74064 11.9221 3.7738 11.8889 3.81472 11.8889H14.1851C14.226 11.8889 14.2592 11.922 14.2592 11.963C14.2592 12.0039 14.226 12.037 14.1851 12.037H3.81472C3.7738 12.037 3.74064 12.0039 3.74064 11.963Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.33333"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.07397 6.03704C3.07397 5.62794 3.40562 5.2963 3.81472 5.2963H14.1851C14.5942 5.2963 14.9258 5.62794 14.9258 6.03704C14.9258 6.44613 14.5942 6.77778 14.1851 6.77778H3.81472C3.40562 6.77778 3.07397 6.44613 3.07397 6.03704Z"
                        fill="white"
                      ></path>
                    </svg>
                  </div>
                </label>
              </div>
              <div className="drawer-side">
                <label
                  htmlFor="my-drawer-4"
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="menu fixed p-4 w-[350px] min-h-[700px] rounded-2xl bg-base-200 text-base-content">
                  <li>
                    <Link
                      onClick={() => {
                        // document.getElementById('my-drawer-3').click()
                      }}
                      to="/marketplace"
                    >
                      Market Place
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
