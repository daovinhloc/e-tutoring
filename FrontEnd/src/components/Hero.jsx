import { Link } from 'react-router-dom'
import Hero from '../assets/hero.png'
const HeroSection = () => {
  return (
    <div className='pt-24'>
      <div className='container mx-auto flex flex-wrap flex-col md:flex-row items-center'>
        <div className='flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left'>
          <p className='uppercase tracking-loose w-full'>We help you</p>
          <h1 className='my-4 text-5xl font-normal leading-tight'>
            Finding your favorite tutor with{' '}
            <span className='font-extrabold bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text'>
              TUTOR
            </span>
          </h1>
          <p className='leading-normal text-2xl mb-8'>
            Connecting you with the best tutors to unlock your full potential.
          </p>
          <button className='mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out'>
            <Link to='/register-tutor'>Subscribe</Link>
          </button>
        </div>
        <div className='w-full md:w-3/5 py-6 text-center'>
          <img className='w-full md:w-4/5 z-50' src={Hero} />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
