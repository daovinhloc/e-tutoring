export default function Loading() {
  return (
    <div className='w-full h-full z-50 bg-white text-4xl fixed top-0 left-0 text-center text-orange-300'>
      <div style={{ marginTop: '15%' }} className='w-fit mx-auto'>
        <i className='fa-solid fa-spinner fa-spin'></i>
      </div>
    </div>
  )
}
