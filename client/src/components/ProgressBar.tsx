import React from 'react'

const ProgressBar = ({ duration }: any) => {
  const [timeLeft, setTimeLeft] = React.useState(duration)
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime: any) => {
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

  React.useEffect(() => {
    const totalMilliseconds = duration
    const progressDecrement = 100 / totalMilliseconds
    setProgress((prevProgress) => prevProgress - progressDecrement * 1000)
  }, [timeLeft, duration])

  const formatTime = (milliseconds: any) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    const formattedHours = (hours % 24).toString().padStart(2, '0')
    const formattedMins = mins.toString().padStart(2, '0')
    const formattedSecs = secs.toString().padStart(2, '0')

    return `${formattedHours}:${formattedMins}:${formattedSecs}`
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
