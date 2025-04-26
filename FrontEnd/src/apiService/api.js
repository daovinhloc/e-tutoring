// apiService/api.js

import axios from 'axios'
import supabase from './supabase'
const API_URL = import.meta.env.VITE_API_URL + `/api`
// const API_URL = 'http://localhost:5000/api'
// const API_URL = 'https://e59e-171-233-29-47.ngrok-free.app/api' //

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password })
    if (response) {
      const { data, error } = await supabase.auth.signInWithPassword({
        password: password,
        email: email
      })
      if (data) {
        console.log(data)

        return { ...response.data, user: { ...data.user, ...response.data.user, session: data.session } }
      }
    }
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : 'Login failed')
  }
}

export const registerStudent = async (
  email,
  userName,
  password,
  fullName,
  avatar,
  dateOfBirth,
  phone,
  address,
  grade,
  school
) => {
  try {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('userName', userName)
    formData.append('password', password)
    formData.append('fullName', fullName)
    formData.append('avatar', avatar)
    formData.append('dateOfBirth', dateOfBirth)
    formData.append('phone', phone)
    formData.append('address', address)

    formData.append('grade', grade)
    formData.append('school', school)
    console.log('Received Data:', {
      email,
      userName,
      password,
      fullName,
      avatar,
      dateOfBirth,
      phone,
      address,
      grade,
      school
    })

    console.log('Register Student Form Data:', formData)

    const response = await axios.post(`${API_URL}/auth/registerStudent`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })
    if (error) {
      throw new Error('sign up supabase failed', error)
    }

    return { ...response.data, user: { ...data.user, ...response.data.user, session: data.session } }
  } catch (error) {
    console.error('Error in registerStudent:', error.response || error.message || error)

    throw new Error(error.response ? error.response.data.message : 'Registration failed')
  }
}

export const registerTutor = async (
  email,
  userName,
  password,
  fullName,
  avatar,
  dateOfBirth,
  phone,
  address,
  workplace,
  credentialFile,
  degreeFile,
  description
) => {
  try {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('userName', userName)
    formData.append('password', password)
    formData.append('fullName', fullName)
    formData.append('avatar', avatar)
    formData.append('dateOfBirth', dateOfBirth)
    formData.append('phone', phone)
    formData.append('address', address)

    formData.append('workplace', workplace)
    formData.append('identityCard', credentialFile)
    formData.append('degrees', degreeFile)
    formData.append('description', description)

    const response = await axios.post(`${API_URL}/auth/registerTutor`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })
    if (error) {
      throw new Error('sign up supabase failed', error)
    }

    return { ...response.data, user: { ...data.user, ...response.data.user, session: data.session } }
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : 'Registration failed')
  }
}

export const fetchUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : 'Failed to fetch user profile')
  }
}

export const uploadFileToSupabase = async (file) => { }
