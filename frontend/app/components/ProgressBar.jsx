import React, { useState, useEffect } from 'react'

const ProgressBar = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const progressIncrement = 100 / duration
    setProgress(100 - timeLeft * progressIncrement)
  }, [timeLeft, duration])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-3">
      <div className="text-sm text-end font-bold">{formatTime(timeLeft)}</div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-green-600 h-1 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar

// Usage:
// <CountdownProgressBar duration={60} />  // 60 seconds countdown
