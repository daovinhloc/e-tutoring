import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'

import { useNavigate } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'
import { Password } from '../components/Password.jsx'
import AuthContext from '../contexts/JWTAuthContext'
import { jwtDecode } from 'jwt-decode'
import logo from '../assets/logo.png'
import { RecoveryContext } from '../App'
import { makePut } from '../apiService/httpService.js'
import supabase from '../apiService/supabase.js'

const Reset = () => {
  const { email, otp } = useContext(RecoveryContext)
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { user, logout } = useContext(AuthContext)

  const [userData, setUserData] = useState({})
  const token = localStorage.getItem('token')

  const navigate = useNavigate()
  useEffect(() => {
    if (user) {
      setUserData(user)
    } else if (token) {
      const decodedToken = jwtDecode(token)
      setUserData(decodedToken.user)
    }
  }, [user])

  const handleChangePassword = async () => {
    try {
      console.log(email)
      console.log(password)
      const response = await makePut('auth/update-password', {
        email: email,
        newPassword: password
      })
      if (response) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password: password
        })
        if (updateErr) {
          setErrorMessage(updateErr.message)
        }
        console.log('Password updated successfully:', response.data)
        logout()
        // Optionally, handle success or redirect to a success page
        navigate('/login') // Redirect to login page after successful password reset
      }
    } catch (error) {
      console.error('Error updating password:', error)
      setErrorMessage(error.message || 'Error updating password')
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 px-6'>
      <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8'>
        <div className='mt-8 mb-2 w-80 max-w-screen-lg sm:w-96'>
          <a href='./' className='flex justify-center'>
            <img className='h-15 w-48' src={logo} alt='Workflow' />
          </a>
          <Typography variant='h2' color='blue-gray' className='-mb-3 flex justify-center'>
            Change Password
          </Typography>
          <div className='mt-6 w-full'>
            <Typography variant='h6' label='Email address'>
              Email Address:
            </Typography>
            <Typography label='Email address'>{email}</Typography>
          </div>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state directly
          />

          {errorMessage && (
            <Typography color='red' className='mt-4 text-red-500'>
              {errorMessage}
            </Typography>
          )}

          <div className='mt-6'>
            <span className='block w-full rounded-md shadow-sm'>
              <button
                type='button' // Change type to 'button' to prevent form submission
                onClick={handleChangePassword} // Handle password change directly
                className='flex flex-row cursor-pointer items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-orange-500 border-none text-white text-sm shadow-sm'
              >
                Reset Password
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reset
