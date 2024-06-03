import React from 'react'
import Navbar from './components/Navbar'
import Banner from './components/Banner'

export default function App() {
  return (
    <div className="w-full flex relative h-[1700px] flex-col items-center">
      <Navbar />
      <Banner />
    </div>
  )
}
