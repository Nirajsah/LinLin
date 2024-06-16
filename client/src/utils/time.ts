export function convertMillisToDateTime(milliseconds: number) {
  const date = new Date(milliseconds)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const formattedDate = `${year}-${month}-${day}`
  const formattedTime = `${hours}:${minutes}:${seconds}`
  return { formattedDate, formattedTime }
}

export function convertDateTimeToMillis(dateTimeString: string) {
  const [date, time] = dateTimeString.split(' ')
  const [year, month, day]: any = date.split('-')
  const [hours, minutes, seconds]: any = time.split(':')

  const dateObj = new Date(year, month - 1, day, hours, minutes, seconds)
  const milliseconds = dateObj.getTime()

  return milliseconds
}

export function dateTimeToMilliseconds(dateTimeStr: string) {
  const date = new Date(dateTimeStr.replace(' ', 'T'))
  return date.getTime()
}

export function convertMillisecondsToTimeObject(
  timestampInMilliseconds: number
) {
  const targetDate = new Date(timestampInMilliseconds)
  const currentDate = new Date()
  const timeDifference = targetDate.getTime() - currentDate.getTime()

  const totalSeconds = Math.floor(timeDifference / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const remainingSeconds = totalSeconds % (3600 * 24)
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}
