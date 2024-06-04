import React from 'react'

export default function AuctionForm() {
  return (
    <div className="w-full flex p-6 justify-center">
      <div className="w-full max-w-[820px] bg-[#3b3c3e] opacity-65 rounded-2xl p-7 flex justify-between">
        <div className="min-w-[250px] max-h-[250px] bg-[#4c4e4d] rounded-2xl"></div>
        <div className="flex flex-col w-full gap-4 max-w-[450px]">
          <div className="w-full flex flex-col">
            <label>Item Name</label>
            <input
              type="text"
              placeholder="Item Name"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Item Description</label>
            <input
              type="text"
              placeholder="Description"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Bid Amount</label>
            <input
              type="text"
              placeholder="Starting Bid Amount"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Starting Time</label>
            <input
              type="text"
              placeholder="Auction Starting Time"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Ending Time</label>
            <input
              type="text"
              placeholder="Auction Ending Time"
              className="px-3 py-2 font-thin rounded-lg outline-none  w-full"
            />
          </div>
          <div className="flex mt-4 w-fit gap-3 self-end">
            <button className="text-black text-sm w-fit bg-button-color grid place-content-center rounded-md px-3 py-2">
              Cancel
            </button>
            <button className="text-black text-sm w-fit bg-button-color grid place-content-center rounded-md px-3 py-2">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
