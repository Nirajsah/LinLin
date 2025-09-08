export default function LoginButton({ setOpen }: { setOpen: any }) {
  return (
    <button
      onClick={() => setOpen(true)}
      className="text-black cursor-pointer text-md bg-button-color grid place-content-center rounded-xl px-5 py-2"
    >
      Login
    </button>
  )
}
