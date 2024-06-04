import React from 'react'

export default function AuctionForm() {
  return (
    <div className="w-full flex p-6 justify-center">
      <div className="w-full max-w-[820px] bg-[#3b3c3e] rounded-2xl p-7 flex justify-between">
        <div className="min-w-[250px] max-h-[250px] bg-[#4c4e4d] rounded-2xl"></div>
        <div className="flex flex-col w-full gap-4 max-w-[450px]">
          <div className="w-full flex flex-col">
            <label>Name</label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-error w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Name</label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-error w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Bid Amount</label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-error w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Starting Time</label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-error w-full"
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Ending Time</label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-error w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
