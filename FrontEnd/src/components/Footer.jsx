import Logo from '../assets/logoNav.png'

const Footer = () => {
  return (
    <footer className='bg-gray-800 text-white py-8'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap justify-between'>
          <div className='w-full sm:w-1/3 text-center sm:text-left mb-4 sm:mb-0'>
            <h2 className='text-xl font-bold'>Tutor Renting Website</h2>
            <p>&copy; 2024 Tutor Renting Website. All rights reserved.</p>
            <img src={Logo} className='w-1/4 mt-5' />
          </div>

          <div className='w-full sm:w-1/3 text-right'>
            <h2 className='text-xl font-bold'>Quick Links</h2>
            <ul className='list-none'>
              <li>
                <a href='#' className='hover:underline'>
                  About Us
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Contact
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  FAQ
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-4 text-center sm:text-left'>
          <p className='text-sm'>
            If you have any questions, feel free to contact us at support@tutorwebsite.com or call us at +123-456-7890.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
