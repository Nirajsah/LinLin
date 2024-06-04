import React from 'react'

export default function Navbar() {
  return (
    <div className="p-4 z-10 w-full fixed bg-transparent bg-opacity-95 backdrop-blur-xl flex justify-center">
      <div className="w-full flex justify-between items-center max-w-[1280px]">
        <div className="text-4xl font-bold">LinLin</div>

        <div className="flex gap-5">
          <div className="text-black text-lg bg-button-color grid place-content-center rounded-xl px-3 py-2">
            Host an auction
          </div>

          <div className="drawer drawer-end w-fit h-fit">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
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
                  <a>Sidebar Item 1</a>
                </li>
                <li>
                  <a>Sidebar Item 2</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
