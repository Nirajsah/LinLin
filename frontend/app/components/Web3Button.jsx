import React from 'react'

const Web3Button = ({ label, onClick }) => {
  return (
    <div className="grid place-items-center h-screen bg-[#F5EFE1]">
      <button
        className="
        relative min-w-[250px] min-h-[80px] bg-[#ede4d1] text-[#635c4c]
        border-2 border-[#d4c8a3] rounded-lg cursor-pointer
        text-[1.3rem] tracking-wider
        transform skew-x-[20deg] focus:outline-none
      "
        onClick={onClick}
      >
        <span className="inline-block transform -skew-x-[20deg]">{label}</span>
        <span
          className="
          absolute -top-16 left-4 z-[-1] min-w-[250px] min-h-[80px]
          bg-[#F5EFE1] grid place-items-center
          border-2 border-[#d4c8a3] rounded-lg cursor-pointer
          transition-all duration-500 ease-in-out
          before:content-[attr(data-label)]
          hover:-top-0.5 hover:-left-0.5
        "
          data-label={label}
        />
      </button>
    </div>
  )
}

export default Web3Button
