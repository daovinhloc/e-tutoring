import React, { useState, useContext, useEffect, useRef } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import {
  FaEnvelope,
  FaPhone,
  FaSchool,
  FaBirthdayCake,
  FaGraduationCap,
  FaUser,
  FaRegEdit,
  FaRegAddressCard,
  FaRegUser,
  FaStar,
  FaFileAlt,
  FaBriefcase,
  FaStarHalfAlt
} from 'react-icons/fa'
import AuthContext from '../contexts/JWTAuthContext'
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { v4 } from 'uuid'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { RecoveryContext } from '../App'
import { makePut } from '../apiService/httpService.js'
const UserProfile = () => {
  const token = localStorage.getItem('token')
  const { user } = useContext(AuthContext)
  const [userData, setUserData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const avatarInputRef = useRef(null)
  const identityCardInputRef = useRef(null)
  const degreesInputRef = useRef(null)
  const navigate = useNavigate()
  const { setEmail } = useContext(RecoveryContext)
  useEffect(() => {
    if (user) {
      setUserData(user)
      setOriginalData(user)
    } else if (token) {
      const decodedToken = jwtDecode(token)
      setUserData(decodedToken.user)
      setOriginalData(decodedToken.user)
    }
  }, [user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const uploadFileToFirebase = async (file) => {
    const storageRef = ref(storage, `images/${v4()}-${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
  }

  const handleUpdate = async () => {
    try {
      const updates = {}

      // Age validation
      const today = new Date()
      const dob = new Date(userData.dateOfBirth)
      let age = today.getFullYear() - dob.getFullYear()
      const monthDifference = today.getMonth() - dob.getMonth()
      if ((monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) && age > 0) {
        age--
      }

      if (userData.role === 'Student' && age < 6) {
        toast.error('Student must be at least 6 years old.')
        return
      }
      if (userData.role === 'Tutor' && age < 18) {
        toast.error('Tutor must be at least 18 years old.')
        return
      }

      // Check for avatar changes
      if (userData.avatar !== originalData.avatar) {
        if (userData.avatar instanceof File) {
          const url = await uploadFileToFirebase(userData.avatar)
          updates.avatar = url
        } else {
          updates.avatar = userData.avatar
        }
      }

      // Check for degree changes
      if (userData.degrees !== originalData.degrees) {
        if (userData.degrees instanceof File) {
          const url = await uploadFileToFirebase(userData.degrees)
          updates.degrees = url
        } else {
          updates.degrees = userData.degrees
        }
      }

      // Check for identity card changes
      if (userData.identityCard !== originalData.identityCard) {
        if (userData.identityCard instanceof File) {
          const url = await uploadFileToFirebase(userData.identityCard)
          updates.identityCard = url
        } else {
          updates.identityCard = userData.identityCard
        }
      }

      const updatedUserData = { ...userData, ...updates }

      const userID = user.userID || (await jwtDecode(token).user.userID)
      await makePut(`users/update/${userID}`, {
        updatedUserData
      }).then((data) => {
        localStorage.setItem('token', data.token)
        setUserData(data.user)
        toast.success('Profile updated successfully!')
        setTimeout(() => window.location.reload(), 2500)
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  }

  const handleAvatarClick = () => {
    avatarInputRef.current.click()
  }

  const handleIdentityCardClick = () => {
    identityCardInputRef.current.click()
  }

  const handleDegreesClick = () => {
    degreesInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setUserData({ ...userData, [name]: files[0] })
  }
  const handleResetPassword = (e) => {
    e.preventDefault()
    setEmail(userData.email)
    // Navigate to reset page with email as parameter
    navigate(`/reset-password`)
  }
  const handleDateChange = (e) => {
    setUserData({ ...userData, dateOfBirth: e.target.value })
  }
  const renderRatingStars = () => {
    const rating = parseFloat(userData.rating) || 0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const totalStars = 5

    return (
      <div className='flex'>
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={index} className='text-yellow-500' />
        ))}
        {hasHalfStar && <FaStarHalfAlt className='text-yellow-500' />}
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, index) => (
          <FaStar key={index} className='text-gray-400' />
        ))}
      </div>
    )
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
          {userData.name || userData.userName}'s Profile
        </div>
        <div className='flex items-center w-full mb-4'>
          <div className='avatar-container w-24 h-24 flex-shrink-0 relative cursor-pointer' onClick={handleAvatarClick}>
            <img
              className='avatar-image rounded-full w-full h-full object-cover'
              src={
                userData.avatar instanceof File // Check if avatar is a File object
                  ? URL.createObjectURL(userData.avatar) // Convert File to URL
                  : userData.avatar ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRCdGAc11Bt-rpmGh5q0ESuFgEkDLBUhNOMA&s'
              } // Provide a default avatar if none is set
              alt='User Avatar'
            />
            <div className='avatar-overlay absolute inset-0 bg-black opacity-50 flex justify-center items-center rounded-full'>
              <FaRegEdit className='edit-icon text-white' />
            </div>
          </div>
          <input
            type='file'
            ref={avatarInputRef}
            style={{ display: 'none' }}
            name='avatar'
            accept='image/*'
            onChange={handleFileChange}
          />
          <div className='ml-6 flex-1'>
            <div className='flex items-center'>
              <label className='flex-1'>
                <span className='block text-sm font-medium text-gray-700'>
                  <div className='flex items-center'>
                    <FaUser className='mr-2 text-gray-600' />
                    Username
                  </div>
                </span>
                <input
                  type='text'
                  name='userName'
                  value={userData.userName || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                />
              </label>
            </div>
          </div>
        </div>

        <div className='w-full'>
          <div className='flex items-center mb-4'>
            <label className='flex-1'>
              <span className='block text-sm font-medium text-gray-700'>
                <div className='flex items-center'>
                  <FaRegUser className='mr-2 text-gray-600' />
                  Full Name
                </div>
              </span>
              <input
                type='text'
                name='fullName'
                value={userData.fullName || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </label>
          </div>
          <div className='flex items-center mb-4'>
            <label className='flex-1'>
              <span className='block text-sm font-medium text-gray-700'>
                <div className='flex items-center'>
                  <FaEnvelope className='mr-2 text-gray-600' />
                  Email
                </div>
              </span>

              <input
                type='email'
                name='email'
                value={userData.email || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </label>
          </div>
          <div className='flex items-center mb-4'>
            <label className='flex-1'>
              <span className='block text-sm font-medium text-gray-700'>
                <div className='flex items-center'>
                  <FaPhone className='mr-2 text-gray-600' />
                  Phone Number
                </div>
              </span>
              <input
                type='text'
                name='phone'
                value={userData.phone || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </label>
          </div>
          <div className='flex items-center mb-4'>
            <label className='flex-1'>
              <span className='block text-sm font-medium text-gray-700'>
                <div className='flex items-center'>
                  <FaRegAddressCard className='mr-2 text-gray-600' />
                  Address
                </div>
              </span>
              <input
                type='text'
                name='address'
                value={userData.address || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </label>
          </div>
          <div className='flex items-center mb-4'>
            <label className='flex-1'>
              <span className='block text-sm font-medium text-gray-700'>
                <div className='flex items-center'>
                  <FaBirthdayCake className='mr-2 text-gray-600' />
                  Date of Birth
                </div>
              </span>
              <input
                type='date'
                name='dateOfBirth'
                value={formatDate(userData.dateOfBirth) || '1999-01-01'}
                onChange={handleDateChange}
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              />
            </label>
          </div>
          {userData.role === 'Student' && (
            <>
              <div className='flex items-center mb-4'>
                <label className='flex-1'>
                  <span className='block text-sm font-medium text-gray-700'>
                    <div className='flex items-center'>
                      <FaSchool className='mr-2 text-gray-600' />
                      School
                    </div>
                  </span>
                  <input
                    type='text'
                    name='school'
                    value={userData.school || ''}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                  />
                </label>
              </div>
              <div className='flex items-center mb-4'>
                <label className='flex-1'>
                  <span className='block text-sm font-medium text-gray-700'>
                    <div className='flex items-center'>
                      <FaGraduationCap className='mr-2 text-gray-600' />
                      Grade
                    </div>
                  </span>
                  <input
                    type='text'
                    name='grade'
                    value={userData.grade || ''}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                  />
                </label>
              </div>
            </>
          )}
          {userData.role === 'Tutor' && (
            <>
              <div className='flex items-center mb-4'>
                <label className='flex-1'>
                  <span className='block text-sm font-medium text-gray-700'>
                    <div className='flex items-center'>
                      <FaBriefcase className='mr-2 text-gray-600' />
                      Workplace
                    </div>
                  </span>
                  <input
                    type='text'
                    name='workplace'
                    value={userData.workplace || ''}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                  />
                </label>
              </div>
              <div className='flex items-center mb-4'>
                <label className='flex-1'>
                  <span className='block text-sm font-medium text-gray-700'>
                    <div className='flex items-center'>
                      <FaFileAlt className='mr-2 text-gray-600' />
                      Description
                    </div>
                  </span>
                  <textarea
                    name='description'
                    value={userData.description || ''}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                  />
                </label>
              </div>
              <div className='flex flex-col mb-4'>
                <div className='flex items-center'>
                  <FaStar className='mr-2 text-gray-600' />
                  <span className='block text-sm font-medium text-gray-700'>Rating</span>
                </div>
                <div className='mt-1'>{renderRatingStars()}</div>
              </div>

              <div className='flex flex-col mb-4'>
                <div className='flex items-center'>
                  <FaFileAlt className='mr-2 text-gray-600' />
                  <span className='block text-sm font-medium text-gray-700'>Degrees</span>
                </div>
                <img
                  src={
                    userData.degrees instanceof File
                      ? URL.createObjectURL(userData.degrees) // Convert File to URL
                      : userData.degrees || null
                  }
                  alt='Degrees'
                  className='mt-1 w-full h-auto max-h-60 object-cover border border-gray-300 rounded-md shadow-sm'
                />
                <input
                  type='file'
                  ref={degreesInputRef}
                  // style={{ display: 'none' }}
                  name='degrees'
                  accept='image/*'
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
          <button
            onClick={handleResetPassword}
            className='w-full bg-green-500 text-white mb-2 py-2 px-4 rounded-md shadow-sm hover:bg-green-600 transition duration-300'
          >
            Reset Password
          </button>
          <button
            onClick={handleUpdate}
            className='w-full bg-blue-500 text-white mt-2 py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 transition duration-300'
          >
            Update
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default UserProfile
