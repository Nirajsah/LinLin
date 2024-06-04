import React from 'react'

export default function About() {
  return (
    <div className="w-full max-w-[1180px] p-6 mt-8">
      <div className="w-full h-[400px] justify-center flex rounded-3xl bg-gradient-to-tr from-[#db2777c9] to-[#ea580cd4] p-6">
        <div className="flex flex-col items-center gap-2 p-10">
          <div className="text-4xl">List Your UpComing Auctions Here</div>
          <div className="text-lg font-sans max-w-[800px] text-[#fff] text-center text-opacity-60">
            Join the best creators who list their upcoming mints with Pulse
            drops. Enjoy global access and reach with over 45M followers
            worldwide
          </div>
          <div className="text-black mt-7 text-lg bg-white grid place-content-center rounded-xl px-3 py-2">
            Host an auction
          </div>
        </div>
      </div>
    </div>
  )
}
