export default function Balance({ balanceData }: { balanceData: any }) {
  return (
    <div className="border flex items-center px-3 py-2 rounded-xl">
      <div className="text-white">
        <p>LinCoin: {balanceData?.accounts?.entry?.value ?? '0'}</p>
      </div>
    </div>
  )
}
