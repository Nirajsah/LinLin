import { useState, useEffect } from 'react'

export default function CountDownCard({
  auctionState,
  formattedTime,
}: {
  auctionState: {
    title: string
    timeLeftInMilliseconds: number
  }
  formattedTime: string
}) {
  const parseFormattedTime = (formattedTime: string) => {
    const [hours, minutes, seconds] = formattedTime.split(':').map(Number)
    return hours * 3600000 + minutes * 60000 + seconds * 1000
  }

  const initialTimeLeft = parseFormattedTime(formattedTime)
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1000
        if (newTime <= 0) {
          clearInterval(timer)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
      <div className="text-[#b1b2b5] text-start text-sm">
        {auctionState.title}
      </div>
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
