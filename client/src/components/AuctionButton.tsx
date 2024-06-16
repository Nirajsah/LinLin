export default function AuctionButton({ setHostModal }: { setHostModal: any }) {
  return (
    <button
      onClick={() => setHostModal(true)}
      className="text-black cursor-pointer text-md bg-button-color grid place-content-center rounded-xl px-3 py-2"
    >
      Host an auction
    </button>
  )
}
