import React, { createContext, useEffect, useReducer } from 'react'
import { loginUser, registerStudent, registerTutor, fetchUserProfile } from '../apiService/api'
import Loading from '../components/Loading'
import supabase from '../apiService/supabase'

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isAuthenticated, user } = action.payload
      return { ...state, isAuthenticated, isInitialized: true, user }
    }
    case 'LOGIN': {
      const { token, user } = action.payload
      localStorage.setItem('token', token) // Store token in localStorage
      localStorage.setItem('role', user.role)
      return { ...state, isAuthenticated: true, user }
    }
    case 'LOGOUT': {
      const { error } = supabase.auth.signOut()
      if (error) {
        console.log('There was an error logging out', error)
      } else {
        localStorage.removeItem('token') // Remove token from localStorage on logout
        localStorage.removeItem('role')
      }
      return { ...state, isAuthenticated: false, user: null }
    }

    case 'REGISTER_STUDENT': {
      const { token, user } = action.payload
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role) // Store token in localStorage
      return { ...state, isAuthenticated: true, user }
    }
    case 'REGISTER_TUTOR': {
      const { token, user } = action.payload
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role) // Store token in localStorage
      return { ...state, isAuthenticated: true, user }
    }
    default:
      return state
  }
}

export const AuthContext = createContext({
  ...initialState,
  method: 'BackendAPI', // Indicate the storage method in the context
  login: () => {},
  logout: () => {},

  registerStudent: () => {},
  registerTutor: () => {}
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = async (email, password, rememberMe) => {
    try {
      const { token, user } = await loginUser(email, password)
      dispatch({ type: 'LOGIN', payload: { token, user } })

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  const register = async (userType, formData) => {
    try {
      let response
      if (userType === 'Student') {
        response = await registerStudent(
          formData.email,
          formData.userName,
          formData.password,
          formData.fullName,
          formData.avatar,
          formData.dateOfBirth,
          formData.phone,
          formData.address,

          formData.grade,
          formData.school
        )
        console.log('Registration Response:', response)
        dispatch({ type: 'REGISTER_STUDENT', payload: response })
      } else if (userType === 'Tutor') {
        response = await registerTutor(
          formData.email,
          formData.userName,
          formData.password,
          formData.fullName,
          formData.avatar,
          formData.dateOfBirth,
          formData.phone,
          formData.address,

          formData.workplace,
          formData.credentialFile,
          formData.degreeFile,
          formData.description
        )
        console.log('Registration Response:', response)
        dispatch({ type: 'REGISTER_TUTOR', payload: response })
      }

      localStorage.setItem('rememberMe', 'true')
      return response // Return the response from the API call if needed
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user') // Remove token from localStorage on logout
    dispatch({ type: 'LOGOUT' })
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const { user } = await fetchUserProfile(token)
          dispatch({ type: 'INIT', payload: { isAuthenticated: true, user } })
        } catch (error) {
          console.error(error)
          dispatch({ type: 'INIT', payload: { isAuthenticated: false, user: null } })
        }
      } else {
        dispatch({ type: 'INIT', payload: { isAuthenticated: false, user: null } })
      }
    }

    fetchUser()
  }, [])

  if (!state.isInitialized) return <Loading />

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'BackendAPI',
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
