import React from 'react'

const ProgressBar = ({ duration }: any) => {
  const [timeLeft, setTimeLeft] = React.useState(
    convertDurationToMilliseconds(duration)
  )
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const endTime = new Date().getTime() + timeLeft // Add the duration to the current time in milliseconds
    const timer = setInterval(() => {
      const currentTime = new Date().getTime()
      const remainingTime = endTime - currentTime

      if (remainingTime <= 0) {
        clearInterval(timer)
        setTimeLeft(0)
      } else {
        setTimeLeft(remainingTime)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  React.useEffect(() => {
    const totalMilliseconds = timeLeft
    const progressIncrement = 100 / totalMilliseconds
    setProgress(100 - timeLeft * progressIncrement)
  }, [timeLeft])

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

const convertDurationToMilliseconds = (duration: string) => {
  const [hours, minutes, seconds] = duration.split(':').map(Number)
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds * 1000
}

export default ProgressBar
