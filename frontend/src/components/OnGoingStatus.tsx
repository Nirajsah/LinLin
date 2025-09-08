export default function OnGoingStatus() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
        <span className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ripple opacity-75"></span>
      </div>
    </div>
  )
}
