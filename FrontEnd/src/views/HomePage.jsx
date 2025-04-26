import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import HeroSection from '../components/Hero.jsx'
import Pricing from '../components/Pricing.jsx'
import FeatureSection from '../components/FeatureSection.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Footer from '../components/Footer.jsx'
const HomePage = () => {
  return (
    <div className='min-h-screen bg-gray-100'>
      <MegaMenuWithHover />
      <HeroSection />
      <div className='max-w-7xl mx-auto pt-20 px-6 mb-16'>
        <FeatureSection />
        <Pricing />
        <Testimonials />
      </div>
      <Footer />
    </div>
  )
}

export default HomePage
