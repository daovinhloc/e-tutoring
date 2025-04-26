import React, { useContext, useState } from 'react'
import { AuthContext } from '../contexts/JWTAuthContext.jsx'
import logo from '../assets/logo.png'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import GradePick from '../components/GradePick.jsx'
import { Input } from '@material-tailwind/react'
import { Password } from '../components/Password.jsx'
import { useNavigate } from 'react-router-dom'
import { storage } from '../firebase.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { v4 } from 'uuid'
import axios from 'axios'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    address: '', // Add address field
    avatar: null, // Add avatarFile field

    school: '',
    grade: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }))
  }

  const handleDateChange = (e) => {
    setFormData({ ...formData, dateOfBirth: e.target.value })
  }

  const handleGradeChange = (grade) => {
    setFormData({ ...formData, grade })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({ ...formData, [name]: files[0] })
  }

  const uploadFileToFirebase = async (file) => {
    const storageRef = ref(storage, `images/${v4()}-${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // const usersResponse = await axios.get('http://localhost:5000/api/admin/getUser')
      // const users = usersResponse.data.data

      // // Check if the email exists
      // const emailExists = users.some((user) => user.email === formData.email)
      // if (emailExists) {
      //   toast.error('Email is already registered')
      //   return // Exit the function if the email exists
      // }

      // Age validation
      const today = new Date()
      const dob = new Date(formData.dateOfBirth)
      let age = today.getFullYear() - dob.getFullYear()
      const monthDifference = today.getMonth() - dob.getMonth()
      if ((monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) && age > 0) {
        age--
      }

      if (age < 6) {
        toast.error('Student must be at least 6 years old.')
        return
      }

      const avatarURL = formData.avatar ? await uploadFileToFirebase(formData.avatar) : null

      const updatedFormData = {
        ...formData,
        avatar: avatarURL
      }
      const response = await register('Student', updatedFormData) // Await the register function call
      console.log('Response:', response) // Log response to check its structure
      toast.info('Student registered successfully')

      navigate('/')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(`Error submitting form: ${error.message}`)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <header>
        <MegaMenuWithHover />
      </header>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <a href='./' className='flex justify-center'>
          <img className='h-48 w-48' src={logo} alt='Workflow' />
        </a>
        <h2 className='text-center text-3xl leading-9 font-extrabold text-gray-900'>Create a new student account</h2>
        <p className='mt-2 text-center text-sm leading-5 text-gray-500 max-w'>
          Or
          <a
            href='/login'
            className='font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150'
          >
            {' '}
            Log in to your account
          </a>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form method='POST' onSubmit={handleSubmit}>
            <div className='mt-6 w-full'>
              <Input label='FullName' name='fullName' value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className='mt-6 w-full'>
              <Input label='Username' name='userName' value={formData.userName} onChange={handleChange} required />
            </div>

            <div className='mt-6 w-full'>
              <Input label='Email address' name='email' value={formData.email} onChange={handleChange} required />
            </div>

            <div className='mt-6 w-full'>
              <Input label='Phone number' name='phone' value={formData.phone} onChange={handleChange} />
            </div>

            <div className='mt-6 w-full'>
              <Input label='Address' name='address' value={formData.address} onChange={handleChange} required />
            </div>

            <div className='mt-6 w-full'>
              <input type='file' name='avatar' onChange={handleFileChange} />
            </div>

            <div className='mt-6 flex space-x-4'>
              <div className='w-2/3 box-border'>
                <Input label='School' name='school' value={formData.school} onChange={handleChange} required />
              </div>

              <div className='w-1/3 box-border'>
                <GradePick value={formData.grade} onChange={handleGradeChange} />
              </div>
            </div>

            <div className='mt-6'>
              <label htmlFor='dateOfBirth' className='block text-sm font-medium leading-5 text-gray-700'>
                Date of birth
              </label>
              <div className='mt-1'>
                <input
                  id='dateOfBirth'
                  name='dateOfBirth'
                  type='date'
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  className='mt-1 appearance-none block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5'
                />
              </div>
            </div>

            <Password value={formData.password} onChange={handleChange} />

            <div className='mt-6'>
              <span className='block w-full rounded-md shadow-sm'>
                <button
                  type='submit'
                  className='w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out'
                >
                  Create account
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Register
