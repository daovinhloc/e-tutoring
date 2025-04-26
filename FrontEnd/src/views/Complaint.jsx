import React, { useState, useContext, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Textarea } from '@nextui-org/react'
import 'react-toastify/dist/ReactToastify.css'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import { FaUser } from 'react-icons/fa'
import AuthContext from '../contexts/JWTAuthContext.jsx'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import ChatBox from '../components/ChatBox.jsx'
import { useNavigate } from 'react-router-dom'
import { makePost } from '../apiService/httpService.js'

const Complaint = () => {
  const token = localStorage.getItem('token')
  const { user } = useContext(AuthContext)
  const [userData, setUserData] = useState({})
  const [complaintMessage, setComplaintMessage] = useState('')

  useEffect(() => {
    if (user) {
      setUserData(user)
    } else if (token) {
      const decodedToken = jwtDecode(token)
      setUserData(decodedToken.user)
    }
  }, [user])

  const handleComplaintChange = (e) => {
    const message = e.target.value
    const wordCount = message.trim().split(/\s+/).length

    if (wordCount <= 50) {
      setComplaintMessage(message)
    } else {
      toast.error('Complaint message cannot exceed 50 words.')
    }
  }

  const handleSendComplaint = async () => {
    if (complaintMessage.trim() === '') {
      toast.error('Please enter a complaint message.')
      return
    }

    try {
      const response = makePost('users/complain', {
        userID: userData.userID, // Assuming user ID is stored in userData.id
        message: complaintMessage
      })

      toast.success('Complaint sent successfully!')
      setComplaintMessage('')
    } catch (error) {
      toast.error('Failed to send complaint. Please try again.')
      console.error('Error sending complaint:', error)
    }
  }

  return (
    <div>
      <div className='container mx-auto p-4 pt-16'>
        <header>
          <MegaMenuWithHover />
        </header>
      </div>
      <div className='flex flex-col items-center p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto my-5'>
        <div className='font-extrabold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent text-2xl py-5'>
          Sending Complaint
        </div>
        <div className='flex items-center w-full mb-4'>
          <div className='avatar-container w-24 h-24 flex-shrink-0 relative cursor-pointer'>
            <img
              className='avatar-image rounded-full w-full h-full object-cover'
              src={
                userData.avatar ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRCdGAc11Bt-rpmGh5q0ESuFgEkDLBUhNOMA&s'
              } // Provide a default avatar if none is set
              alt='User Avatar'
            />
          </div>
          <div className='ml-6 flex-1'>
            <div className='flex items-center'>
              <label className='flex-1'>
                <span className='block text-sm font-medium text-gray-700'>
                  <div className='flex items-center'>
                    <FaUser className='mr-2 text-gray-600' />
                    Username
                  </div>
                </span>
                <span className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'>
                  {userData.userName || ''}
                </span>
              </label>
            </div>
          </div>
        </div>
        <Textarea
          variant='faded'
          label='Description'
          placeholder='Enter your complaint (max 50 words)'
          value={complaintMessage}
          onChange={handleComplaintChange}
          className='w-full mt-1 rounded-md shadow-sm pb-2'
        />
        <button
          onClick={handleSendComplaint}
          className='w-full bg-green-500 text-white mb-2 py-2 px-4 rounded-md shadow-sm hover:bg-green-600 transition duration-300'
        >
          Send
        </button>
      </div>
      {/* <ChatBox /> */}
      <ToastContainer />
    </div>
  )
}

export default Complaint
