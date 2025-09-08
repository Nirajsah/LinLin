export default function About() {
  return (
    <div className="w-full max-w-[1180px] p-6 mt-8">
      <div className="w-full h-[400px] justify-center flex rounded-3xl bg-gradient-to-tr from-background-color to-[#ea580cd4] p-6">
        <div className="flex flex-col items-center gap-2 justify-center">
          <div className="text-4xl text-white">Auction Your Items Here</div>
          <div className="text-lg font-sans max-w-[800px] text-[#fff] text-center text-opacity-60">
            Built on the foundation of Linera, the pioneering Layer-1 protocol
            that revolutionizes Web3 scalability with the innovative
            introduction of microchains, enabling unparalleled horizontal
            scaling capabilities.
          </div>
          <div className="text-black mt-7 text-lg bg-button-color grid place-content-center rounded-xl px-3 py-2">
            Host an auction
          </div>
        </div>
      </div>
    </div>
  )
}
