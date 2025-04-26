import React, { useEffect, useState, useRef } from 'react'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import { FaStar, FaUser, FaBook, FaCertificate, FaInfoCircle } from 'react-icons/fa'
import BreadcrumbsWithIcon from '../components/BreadCrumb.jsx' // Adjust path as per your project structure
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeGet, makePost } from '../apiService/httpService'

const ViewTutorProfile = () => {
  const { id } = useParams()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const [tutor, setTutor] = useState([])
  const [user, setUser] = useState([])
  const [isRequestOpen, setRequestOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    if (id) {
      fetchTutor()
    }
    if (token) {
      const decodedToken = jwtDecode(token)
      setUser(decodedToken.user)
    }
  }, [id])

  const fetchTutor = async () => {
    try {
      const response = await makeGet(`users/getTutor/${id}`)
      setTutor(response.data) // Assuming the API response contains the tutor data in `data` field
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching tutor data:', error)
    }
  }

  const handleRequestClick = () => {
    setRequestOpen(!isRequestOpen)
  }

  const handleRequestChange = (e) => {
    setRequestMessage(e.target.value)
  }

  const handleSendRequest = async () => {
    if (role != 'Student' || user.role != 'Student') {
      toast.error('You are not a student!')
    } else {
      if (!requestMessage) {
        toast.error('You cannot send a blank message!')
        return
      }
      try {
        const response = await makePost(`students/requestClass/${tutor.tutorID}`, {
          studentID: user.studentID,
          message: requestMessage
        })
        toast.info('Request message sent!')

        if (chatBoxRef.current) {
          await chatBoxRef.current.refreshUsers()
        }
        // Send the request message to the ChatBox
        await chatBoxRef.current.sendMessage(requestMessage, tutor)

        // Close the request box after sending the message
        setRequestOpen(false)
        setRequestMessage('')
      } catch (error) {
        console.error('Error sending request message:', error)
      }
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='container mx-auto pt-16 '>
        <header>
          <MegaMenuWithHover />
        </header>
      </div>
      <div className='container mx-auto pl-4 flex flex-col md:flex-row gap-8'>
        <div className='w-full md:w-3/4 mb-4 flex flex-col'>
          <BreadcrumbsWithIcon
            pathnames={['Home', 'ClassList', `ClassDetail`, tutor.fullName]} // Update pathnames as per your breadcrumb requirements
          />
        </div>
      </div>
      <div className='flex flex-col items-center p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto'>
        <div className='font-extrabold bg-gradient-to-r mb-7 from-orange-500 to-orange-800 bg-clip-text text-transparent text-2xl py-5'>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          {tutor.fullName}'s Tutor Profile
        </div>
        <div className='flex items-start w-full mb-4 gap-5'>
          <div className='w-72 h-72 flex-shrink-0 mr-6'>
            <img
              className='rounded-full w-full h-full object-cover'
              src={
                tutor.avatar
                  ? tutor.avatar
                  : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp5Ubik9ZId9O2iIKuSPD5ZSS6ef7UzZ04UQ&s'
              }
              alt='Tutor Avatar'
            />
          </div>
          <div className='flex-1'>
            <div className='mb-4'>
              <h2 className='flex items-center'>
                <FaUser className='mr-2 text-gray-600' />
                <p className='mr-2 text-gray-600'>Fullname: </p> {tutor.fullName}
              </h2>
            </div>
            <div className='mb-4 flex items-start'>
              <FaInfoCircle className='mr-2 text-gray-600' />
              <p className='mr-2 text-gray-600'>Description:</p>
              <textarea className='break-words w-full border p-2' value={tutor.description} rows='3' />
            </div>
            <div className='mb-4 flex items-center'>
              <FaBook className='mr-2 text-gray-600' />
              <p className='mr-2 text-gray-600'>Subject: </p>
              <p>{tutor.subjects}</p>
            </div>
            <div className='mb-4 items-center'>
              <div className='flex'>
                <FaCertificate className='mr-2 mt-1 text-gray-600' />
                <p className='mr-2 text-gray-600 mb-3'>Certificate: </p>
              </div>
              <div className='flex-shrink-0'>
                <a href={tutor.degrees} target='_blank' rel='noopener noreferrer'>
                  <img
                    src={tutor.degrees}
                    alt='Tutor Degrees'
                    className='object-contain max-w-full max-h-32' // Adjust max-h to control the height
                    style={{ maxWidth: '100%', maxHeight: '8rem' }} // Inline style for more control
                  />
                </a>
              </div>
            </div>
            <div className='mb-4 flex items-center'>
              <FaStar className='mr-2 text-yellow-600' />
              <p>{tutor.rating || 'No rating'} / 5</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRequestClick}
          className='w-52 bg-g text-black border-orange-400 border-x-4 border-y-4 py-2 px-4 rounded-lg shadow-sm hover:bg-orange-400 transition duration-200 mb-4'
        >
          Send Request
        </button>
        {isRequestOpen && (
          <div className='w-full'>
            <textarea
              value={requestMessage}
              onChange={handleRequestChange}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-4'
              rows='3'
              placeholder='Write your request here...'
            />
            <button
              onClick={handleSendRequest}
              className='w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-600 transition duration-300'
            >
              Send
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default ViewTutorProfile
