import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import { Typography, Card, CardBody } from '@material-tailwind/react'
import BreadcrumbsWithIcon from '../components/BreadCrumb.jsx'
import PriceRangeSlider from '../components/PriceRangeSlider.jsx'
import ChatBox from '../components/ChatBox.jsx'
import { Pagination } from '@nextui-org/react'
import { makeGet } from '../apiService/httpService.js'
import altImageThumbnail from '../assets/hero.png'
import Loading from '../components/Loading.jsx'
import { formatVND } from '../utils/format.js'

const itemsPerPage = 12

const ClassList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState([])
  const [error, setError] = useState(null)

  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [selectedDurations, setSelectedDurations] = useState([])

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterByPrice = (classes, range) => {
    if (range[0] === 0 && range[1] === 5000) return classes
    return classes.filter((cls) => cls.price >= range[0] && cls.price <= range[1])
  }

  const filterByRating = (classes, ratings) => {
    if (ratings.length === 0) return classes
    return classes.filter((cls) => {
      const classRating = Math.floor(cls.rating)
      return ratings.some((rating) => classRating >= rating)
    })
  }

  const convertDurationToRange = (duration) => {
    switch (duration) {
      case '1-4 weeks':
        return [7, 28]
      case '1-3 months':
        return [30, 90]
      case '3-6 months':
        return [90, 180]
      case '6-12 months':
        return [180, 365]
      default:
        return [0, 0]
    }
  }

  const filterByDuration = (classes, durations) => {
    if (durations.length === 0) return classes
    return classes.filter((cls) => {
      const durationInDays = cls.length
      return durations.some((d) => {
        const [min, max] = convertDurationToRange(d)
        return durationInDays > min && durationInDays <= max
      })
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 5000])
    setSelectedRatings([])
    setSelectedDurations([])
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await makeGet('public/users/getAllClass')
        let filteredData = response?.data || []
        filteredData = filterByPrice(filteredData, priceRange)
        filteredData = filterByRating(filteredData, selectedRatings)
        filteredData = filterByDuration(filteredData, selectedDurations)
        setData(filteredData)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchClasses()
  }, [priceRange, selectedRatings, selectedDurations])

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const currentData = [...data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)]

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Tạo breadcrumbs với đường dẫn đúng
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'ClassList', path: '#' } // Trang hiện tại
  ]

  if (error) return <div>Error: {error}</div>

  return (
    <div className='container mx-auto p-4 pt-20'>
      <header>
        <MegaMenuWithHover />
      </header>

      <div className='w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4'>
        <div>
          <BreadcrumbsWithIcon pathnames={breadcrumbs} />
          <Typography variant='h3' className='mt-2 hidden lg:visible'>
            Filters by
          </Typography>
        </div>
        <div className='lg:pl-10'>
          <Typography variant='h4'>
            {data.length <= 1 ? <div>There is {data.length} class</div> : <div>There are {data.length} classes</div>}
          </Typography>
        </div>
      </div>

      <div className='block lg:hidden mb-4 ml-4 pl-1'>
        <button className='bg-orange-400 text-white px-4 py-2 rounded' onClick={() => setIsFilterOpen(true)}>
          All Filters
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 flex transition-all duration-300 ${
          isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isFilterOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsFilterOpen(false)}
        />
        <aside
          className={`fixed right-0 top-0 h-full w-4/5 sm:w-2/3 md:w-1/2 bg-white shadow-lg p-4 overflow-y-auto transform transition-transform duration-300 ${
            isFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-bold'>Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className='text-gray-500 hover:text-red-500 text-xl font-bold'
            >
              ×
            </button>
          </div>
          <Filters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedRatings={selectedRatings}
            setSelectedRatings={setSelectedRatings}
            selectedDurations={selectedDurations}
            setSelectedDurations={setSelectedDurations}
          />
          <div className='mt-6'>
            <button
              onClick={() => {
                clearFilters()
                setIsFilterOpen(false)
              }}
              className='bg-transparent text-orange-800 px-2 py-1 rounded hover:bg-orange-200 transition'
            >
              Clear Filters
            </button>
          </div>
        </aside>
      </div>

      <div className='flex'>
        <aside className='hidden lg:block lg:w-1/4 p-4 rounded-lg shadow-md'>
          <Filters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedRatings={selectedRatings}
            setSelectedRatings={setSelectedRatings}
            selectedDurations={selectedDurations}
            setSelectedDurations={setSelectedDurations}
          />
          <div className='mt-6'>
            <button
              onClick={clearFilters}
              className='bg-transparent text-orange-800 px-2 py-1 rounded hover:bg-orange-200 transition'
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <main className='w-full lg:w-3/4 px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {currentData.map((item) => (
              <Link to={`/classDetail/${item.classID}`} key={item.classID} state={item}>
                <Card className='group relative overflow-hidden hover:opacity-75'>
                  <img
                    src={
                      item.videoLink
                        ? `https://img.youtube.com/vi/${item?.videoLink?.split('v=')[1]}/0.jpg`
                        : altImageThumbnail
                    }
                    alt={item.className}
                    className='object-cover aspect-video'
                  />
                  <CardBody className='py-4'>
                    <Typography variant='h5' className='font-bold'>
                      {item.className}
                    </Typography>
                    <Typography tag='h3' className='mt-2'>
                      Tutor: {item.tutorFullName}
                    </Typography>
                    {item.type && (
                      <Typography tag='h3' className='mt-2'>
                        Type: {item.type}
                      </Typography>
                    )}
                    <Typography tag='h3' className='mt-2'>
                      Duration: {item.length}
                    </Typography>
                    <Typography tag='h3' className='mt-2'>
                      Price per hour: {formatVND(item.price)}
                    </Typography>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          <div className='flex justify-center mt-8'>
            <Pagination total={totalPages} active={currentPage} onChange={handlePageChange} />
          </div>
        </main>
      </div>

      {/* <ChatBox /> */}
    </div>
  )
}

const Filters = ({
  priceRange,
  setPriceRange,
  selectedRatings,
  setSelectedRatings,
  selectedDurations,
  setSelectedDurations
}) => (
  <>
    <PriceRangeSlider onChange={(value) => setPriceRange(value)} />

    <div className='mt-6'>
      <Typography variant='h6' className='text-gray-800 font-bold mb-2'>
        Filter by Rating
      </Typography>
      <div className='space-y-2'>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label className='flex items-center' key={rating}>
            <input
              type='checkbox'
              className='form-checkbox text-blue-500'
              checked={selectedRatings.includes(rating)}
              onChange={() =>
                setSelectedRatings((prev) =>
                  prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
                )
              }
            />
            <span className='ml-2 text-gray-700'>{rating} Stars & Up</span>
          </label>
        ))}
      </div>
    </div>

    <div className='mt-6'>
      <Typography variant='h6' className='text-gray-800 font-bold mb-2'>
        Filter by Duration
      </Typography>
      <div className='space-y-2'>
        {['1-4 weeks', '1-3 months', '3-6 months', '6-12 months'].map((duration) => (
          <label className='flex items-center' key={duration}>
            <input
              type='checkbox'
              className='form-checkbox text-blue-500'
              checked={selectedDurations.includes(duration)}
              onChange={() =>
                setSelectedDurations((prev) =>
                  prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration]
                )
              }
            />
            <span className='ml-2 text-gray-700'>{duration}</span>
          </label>
        ))}
      </div>
    </div>
  </>
)

export default ClassList
