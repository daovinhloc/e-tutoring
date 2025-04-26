import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import MegaMenuWithHover from '../components/MegaMenuWithHover'
import AuthContext from '../contexts/JWTAuthContext' // Import AuthContext
import ChatBox from '../components/ChatBox'
import { makeGet, makePost, makePostFormData } from '../apiService/httpService'

const TutorRequest = () => {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const { isAuthenticated, user } = useContext(AuthContext)
  const [classroom, setClassroom] = useState({
    subjectID: '',
    studentID: '',
    PaymentID: '',
    length: '',
    ClassPerWeek: '',
    type: '',
    description: '',
    price: '',
    tutorID: '',
    className: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const role = user?.role || ''

    if (role !== 'Tutor' && role !== 'Admin') {
      navigate('/')
      return
    }
    if (user && user.tutorID) {
      makeGet(`tutors/viewRequest/${user.tutorID}`)
        .then((response) => {
          if (response && response.data) {
            setRequests(response.data)
          }
        })
        .catch((error) => {
          console.error('There was an error fetching the requests!', error)
        })
    }
  }, [navigate])

  const handleAccept = (event) => {
    event.preventDefault()
    const data = {
      requestID: selectedRequest.requestID,
      confirm: true,
      classroom: {
        ...classroom,
        studentID: selectedRequest.studentID,
        tutorID: tutorID
      }
    }

    makePostFormData('tutors/confirmRequest', data)
      .then((response) => {
        alert('Request accepted successfully')
        // Refresh the requests list
        makeGet(`tutors/viewRequest/${tutorID}`).then((response) => {
          if (response && response.data) {
            setRequests(response.data)
          }
        })
      })
      .catch((error) => {
        console.error('There was an error confirming the request!', error)
      })
  }

  const handleDeny = (requestID) => {
    makePostFormData('tutors/confirmRequest', {
      requestID: requestID,
      confirm: false
    })
      .then((response) => {
        alert('Request denied successfully')
        // Refresh the requests list
        const token = localStorage.getItem('token')
        const decodedToken = jwtDecode(token)
        const tutorID = decodedToken.user.tutorID

        makeGet(`tutors/viewRequest/${tutorID}`).then((response) => {
          if (response && response.data) {
            setRequests(response.data)
          }
        })
      })
      .catch((error) => {
        console.error('There was an error denying the request!', error)
      })
  }

  return (
    <div className='tutor-request-container'>
      <header>
        <MegaMenuWithHover />
      </header>
      <div className='main-content mt-20 py-4 mx-auto w-8/12'>
        <h2>Requests</h2>
        <ul className='request-list'>
          {requests.map((request) => (
            <li key={request.requestID} className='request-item'>
              <p>Student ID: {request.studentID}</p>
              <p>Message: {request.message}</p>
              <button className='accept-button' onClick={() => setSelectedRequest(request)}>
                Accept
              </button>
              <button className='deny-button' onClick={() => handleDeny(request.requestID)}>
                Deny
              </button>
            </li>
          ))}
        </ul>
        {selectedRequest && (
          <div className='accept-request-form'>
            <h3>Accept Request</h3>
            <form onSubmit={handleAccept}>
              <label>
                Subject ID:
                <input
                  type='text'
                  value={classroom.subjectID}
                  onChange={(e) => setClassroom({ ...classroom, subjectID: e.target.value })}
                />
              </label>
              <label>
                Payment ID:
                <input
                  type='number'
                  value={classroom.PaymentID}
                  onChange={(e) => setClassroom({ ...classroom, PaymentID: e.target.value })}
                />
              </label>
              <label>
                Length:
                <input
                  type='text'
                  value={classroom.length}
                  onChange={(e) => setClassroom({ ...classroom, length: e.target.value })}
                />
              </label>
              <label>
                Classes Per Week:
                <input
                  type='text'
                  value={classroom.ClassPerWeek}
                  onChange={(e) => setClassroom({ ...classroom, ClassPerWeek: e.target.value })}
                />
              </label>
              <label>
                Type:
                <input
                  type='text'
                  value={classroom.type}
                  onChange={(e) => setClassroom({ ...classroom, type: e.target.value })}
                />
              </label>
              <label>
                Description:
                <input
                  type='text'
                  value={classroom.description}
                  onChange={(e) => setClassroom({ ...classroom, description: e.target.value })}
                />
              </label>
              <label>
                Price:
                <input
                  type='number'
                  value={classroom.price}
                  onChange={(e) => setClassroom({ ...classroom, price: e.target.value })}
                />
              </label>
              <label>
                Class Name:
                <input
                  type='text'
                  value={classroom.className}
                  onChange={(e) => setClassroom({ ...classroom, className: e.target.value })}
                />
              </label>
              <button type='submit'>Confirm</button>
            </form>
          </div>
        )}
      </div>
      {/* <ChatBox /> */}
    </div>
  )
}

export default TutorRequest
