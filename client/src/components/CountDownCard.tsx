import { useState, useEffect } from 'react'

export default function CountDownCard({
  auctionState,
}: {
  auctionState: {
    title: string
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: auctionState.days,
    hours: auctionState.hours,
    minutes: auctionState.minutes,
    seconds: auctionState.seconds,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
          if (minutes < 0) {
            minutes = 59
            hours--
            if (hours < 0) {
              hours = 23
              days--
              if (days < 0) {
                clearInterval(timer)
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
              }
            }
          }
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#232429] grid place-content-center rounded-2xl">
      <div className="text-[#b1b2b5] text-start text-sm">
        {auctionState.title}
      </div>
      <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[#b1b2b5] text-xs">days</span>
        </div>
        <div className="text-xl">:</div>
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[#b1b2b5] text-xs">hours</span>
        </div>

        <div className="text-xl">:</div>
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[#b1b2b5] text-xs">min</span>
        </div>

        <div className="text-xl">:</div>
        <div className="flex flex-col">
          <span className="text-lg text-white">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[#b1b2b5] text-xs">sec</span>
        </div>
      </div>
    </div>
  )
}
