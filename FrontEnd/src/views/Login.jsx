import React, { useState, useContext } from 'react'
import logo from '../assets/logo.png'
import { Input, Checkbox, Typography } from '@material-tailwind/react'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import AuthContext from '../contexts/JWTAuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { RecoveryContext } from '../App'
import { makePost } from '../apiService/httpService.js'
const Login = () => {
  const navigate = useNavigate()
  const { setOTP, setEmail } = useContext(RecoveryContext)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  })

  const [errorMessage, setErrorMessage] = useState('') // Error state

  const { login } = useContext(AuthContext) // Consume login function from AuthContext

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('') // Reset error message
    try {
      await login(formData.email, formData.password, formData.rememberMe) // Use login function from AuthContext
      navigate('/') // Redirect after successful login
    } catch (error) {
      setErrorMessage(error.message || 'Invalid email or password') // Set error message
    }
  }
  const handleForgotPassword = (e) => {
    e.preventDefault()
    // Navigate to reset page with email as parameter
    navigate(`/reset-password?email=${formData.email}`)
  }

  const handleForgotPasswordnew = (e) => {
    if (formData.email) {
      const OTP = Math.floor(Math.random() * 9000 + 1000)
      console.log(OTP)
      setOTP(OTP)
      setEmail(formData.email)

      axios.post(import.meta.env.VITE_API_URL + '/send_recovery_email', {
        OTP,
        recipient_email: formData.email
      })
      navigate(`/OTP-page`)

      return
    }
    return alert('Please enter your email')
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 px-6'>
      <header>
        <MegaMenuWithHover />
      </header>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <a href='./' className='flex justify-center'>
          <img className='h-48 w-48' src={logo} alt='Workflow' />
        </a>

        <h2 className='text-center text-3xl leading-9 font-extrabold text-gray-900'>Sign in to your account</h2>
        <p className='mt-2 text-center text-sm leading-5 text-blue-500 max-w'>
          Or
          <a
            href='/register-student'
            className='font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150'
          >
            {' '}
            create a new account
          </a>
        </p>
      </div>
      <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8'>
        <form className='mt-8 mb-2 w-80 max-w-screen-lg sm:w-96' onSubmit={handleSubmit}>
          <div className='mb-1 flex flex-col gap-6'>
            <Typography variant='h6' color='blue-gray' className='-mb-3'>
              Your Email <span className='text-red-500 ml-1'>*</span>
            </Typography>
            <Input
              size='lg'
              placeholder='name@mail.com'
              className='!border-t-blue-gray-200 focus:!border-t-gray-900'
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
              name='email'
              value={formData.email}
              onChange={handleChange}
            />

            <Typography variant='h6' color='blue-gray' className='-mb-3'>
              Password <span className='text-red-500 ml-1'>*</span>
            </Typography>
            <Input
              type='password'
              size='lg'
              placeholder='********'
              className='!border-t-blue-gray-200 focus:!border-t-gray-900'
              labelProps={{
                className: 'before:content-none after:content-none'
              }}
              name='password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className='mt-6 flex items-center justify-between'>
            <Checkbox
              label={
                <Typography variant='small' color='gray' className='flex items-center font-normal'>
                  Remember me
                </Typography>
              }
              containerProps={{ className: '-ml-2.5' }}
              name='rememberMe'
              checked={formData.rememberMe}
              onChange={handleChange}
            />

            <div className='text-sm leading-5'>
              <a
                href='#'
                onClick={handleForgotPasswordnew}
                className='font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150'
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {errorMessage && (
            <Typography color='red' className='mt-4 text-red-500'>
              {errorMessage}
            </Typography>
          )}

          <div className='mt-6'>
            <span className='block w-full rounded-md shadow-sm'>
              <button
                type='submit'
                className='w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out'
              >
                Sign In
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
