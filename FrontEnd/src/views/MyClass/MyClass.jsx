import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@material-tailwind/react'
import { ChatBubbleLeftIcon, NewspaperIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import BreadcrumbsWithIcon from '../../components/BreadCrumb.jsx'
import MegaMenuWithHover from '../../components/MegaMenuWithHover.jsx'
import { makeGet } from '../../apiService/httpService.js'
import { useEffect } from 'react'
import AuthContext from '../../contexts/JWTAuthContext.jsx'
import ClassDocumentList from '../../components/ClassDocumentList.jsx'

const MyClass = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useContext(AuthContext)
  const [showDocuments, setShowDocuments] = useState(false)
  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await makeGet('students/classes')

      if (!response) {
        setError('No data found')
        return
      }
      const data = response.data

      setClasses(data)
      setSelectedClass(data[0]) // Set the first class as selected
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  // Hàm format ngày tháng năm
  const formatDate = (dateStr) => {
    if (!dateStr) return ''

    try {
      const date = new Date(dateStr)

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateStr
    }
  }

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'My Classes', path: '#' }
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <header className='bg-orange-400 text-white shadow-md fixed top-0 w-full z-20'>
        <MegaMenuWithHover />
      </header>

      <div className='container mx-auto flex-1 flex flex-col pt-20 px-3 sm:px-4 md:px-6 lg:px-8'>
        {/* Breadcrumb section - Responsive */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200 mb-4 sm:mb-6 gap-2'>
          <BreadcrumbsWithIcon pathnames={breadcrumbs} />

          {/* Toggle sidebar button on mobile */}
          <button
            className='lg:hidden px-3 py-1 bg-blue-900 text-white rounded-md flex items-center'
            onClick={toggleSidebar}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='w-5 h-5 mr-1'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16m-7 6h7' />
            </svg>
            {sidebarOpen ? 'Hide Classes' : 'Show Classes'}
          </button>
        </div>

        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 h-full'>
          {/* Sidebar - Responsive */}
          <aside
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } lg:block lg:w-64 bg-blue-900 text-white p-4 sm:p-6 rounded-lg shadow-md lg:sticky lg:top-32 self-start transition-all duration-300 z-10`}
          >
            <h2 className='text-xl font-semibold mb-4 sm:mb-6'>My Classes</h2>
            <div className='max-h-[60vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto'>
              <ul className='space-y-2'>
                {classes.map((cls) => (
                  <li
                    key={cls.classID}
                    className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedClass.classID === cls.classID ? 'bg-blue-700' : 'hover:bg-blue-700'
                    }`}
                    onClick={() => {
                      setSelectedClass(cls)
                      setShowDocuments(false)
                      setSidebarOpen(false) // Close sidebar on mobile after selection
                    }}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedClass(cls)}
                    aria-current={selectedClass.classID === cls.classID ? 'true' : 'false'}
                  >
                    <span className='block text-sm font-medium truncate'>{cls.className}</span>
                    <span className='text-xs text-blue-200'>{cls.subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className='flex-1 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md min-h-[calc(100vh-180px)]'>
            {loading ? (
              <div className='flex justify-center items-center h-full'>
                <div className='animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500'></div>
                <p className='ml-3 text-orange-500'>Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-500 p-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253'
                  />
                </svg>
                <p className='text-lg sm:text-xl font-medium text-center'>No classes found</p>
                <p className='mt-2 text-gray-500 text-center'>You haven't enrolled in any classes yet.</p>
              </div>
            ) : (
              <>
                <div className='space-y-6'>
                  <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{selectedClass.className}</h1>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4'>
                    <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Subject: <span className='font-medium text-gray-800'>{selectedClass.subject}</span>
                      </p>
                    </div>
                    <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Tutor: <span className='font-medium text-gray-800'>{selectedClass.tutorFullName}</span>
                      </p>
                    </div>
                    <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Enrolled Date:{' '}
                        <span className='font-medium text-gray-800'>{formatDate(selectedClass.enrolledAt)}</span>
                      </p>
                    </div>
                    <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Status: <span className='font-medium text-green-600'>Active</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className='flex gap-3 items-center'>
                      <Link
                        to={`/classroom?room=${encodeURIComponent(selectedClass.className)}&name=${encodeURIComponent(
                          user?.fullName || 'Student'
                        )}`}
                        className='flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base py-2 px-3 sm:py-2.5 sm:px-4 rounded'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 sm:h-5 sm:w-5 mr-2'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                          />
                        </svg>
                        Join Room
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-700 mb-3'>Resources</h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <button
                        onClick={() => {
                          setShowDocuments((prev) => !prev)
                        }}
                        className='flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded font-medium'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        <span>Documents</span>
                      </button>

                      <Link
                        to={`/my-classes/${selectedClass.classID}/blogs`}
                        className='flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded font-medium'
                      >
                        <NewspaperIcon className='h-5 w-5' />
                        <span>Blogs</span>
                      </Link>

                      <Link
                        to={`/my-classes/${selectedClass.classID}/stream`}
                        className='flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded font-medium'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                          />
                        </svg>
                        <span>Stream</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {showDocuments && (
                  <div className='mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50'>
                    <h3 className='text-lg font-semibold text-gray-700 mb-3'>Class Documents</h3>
                    {user && user.role && (
                      <ClassDocumentList role={user.role} classId={selectedClass.classID} key={selectedClass.classID} />
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default MyClass
