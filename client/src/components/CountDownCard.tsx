import { useState, useEffect } from 'react'

export default function CountDownCard({
  auctionTimeInMilliseconds,
  title,
}: {
  title: string
  auctionTimeInMilliseconds: number
}) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const currentTime = Date.now()
    const timeUntilAuctionStart = auctionTimeInMilliseconds - currentTime

    const timer = setInterval(() => {
      const newTimeLeft = timeUntilAuctionStart - (Date.now() - currentTime)
      setTimeLeft(newTimeLeft <= 0 ? 0 : newTimeLeft)
      if (newTimeLeft <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [auctionTimeInMilliseconds])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000)
    const minutes = Math.floor((time % 3600000) / 60000)
    const seconds = Math.floor((time % 60000) / 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`
  }

  const displayedTime = formatTime(timeLeft)

  return (
    <div className="bg-[#232429] grid place-content-center rounded-2xl">
      <div className="text-[#b1b2b5] text-start text-sm">{title}</div>
      <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {displayedTime.split(':')[0]}
          </span>
          <span className="text-[#b1b2b5] text-xs">hours</span>
        </div>

        <div className="text-xl">:</div>
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {displayedTime.split(':')[1]}
          </span>
          <span className="text-[#b1b2b5] text-xs">min</span>
        </div>

        <div className="text-xl">:</div>
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {displayedTime.split(':')[2]}
          </span>
          <span className="text-[#b1b2b5] text-xs">sec</span>
        </div>
      </div>
    </div>
  )
}
