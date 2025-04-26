import React, { useState, useEffect, useRef, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { Button, Card, CardBody, Typography } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStar, faStarHalfAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faFlag } from '@fortawesome/free-solid-svg-icons'
import { CircularImg } from '../components/CircularImg.jsx'
import BreadcrumbsWithIcon from '../components/BreadCrumb.jsx'
import MegaMenuWithHover from '../components/MegaMenuWithHover.jsx'
import StarRating from '../components/StarRating'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatBox from '../components/ChatBox.jsx'
import Loading from '../components/Loading.jsx'
import { makeGet, makePost } from '../apiService/httpService.js'
import altImageThumbnail from '../assets/hero.png'
import { formatVND } from '../utils/format.js'
import AuthContext from '../contexts/JWTAuthContext'

const ClassDetail = () => {
  const { id } = useParams()
  const [showVideo, setShowVideo] = useState(false)
  const [classData, setClassData] = useState({})
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isActiveStudent, setIsActiveStudent] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbacks, setFeedbacks] = useState([])
  const [enrollError, setEnrollError] = useState('')
  const [rating, setRating] = useState('0')
  const [isReportHovered, setIsReportHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const chatBoxRef = useRef()

  useEffect(() => {
    if (id) {
      fetchSearchData()
    }
  }, [id])

  const fetchSearchData = async () => {
    setLoading(true)
    try {
      fetchClass()
      checkEnrollmentStatus()
      fetchFeedbacks()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClass = async () => {
    try {
      const response = await makeGet(`users/getClass/${id}`)
      const classDetails = response?.data // Assuming API response contains all required fields
      setClassData(classDetails)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await makeGet(`students/getFeedbackByClass/${id}`)
      if (response && response.data) {
        setFeedbacks(response.data || [])
      } else {
        setFeedbacks([])
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      setFeedbacks([])
    }
  }

  const checkEnrollmentStatus = async () => {
    try {
      if (user && user.role === 'Student') {
        // Check if student is enrolled in the class
        const studentID = user.studentID

        // Check enrollment status through Class_Students table
        try {
          const response = await makeGet(`students/checkActiveEnrollment/${id}/${studentID}`)
          setIsActiveStudent(response?.isActive || false)
        } catch (err) {
          setIsActiveStudent(false)
        }

        // Keep old check
        const enrollResponse = await makeGet(`students/checkEnroll/${id}`)
        if (enrollResponse && (enrollResponse.status === 'true' || enrollResponse.status === true)) {
          setIsEnrolled(true)
        } else {
          setIsEnrolled(false)
        }
        setEnrollError('')
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
    }
  }

  const handleRatingChange = (selectedRating) => {
    setRating(selectedRating)
  }

  const handleEnrollNow = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('You need to log in before enrolling into this class')
        return
      }
      const decodedToken = jwtDecode(token)
      if (decodedToken.user.role == 'Student') {
        const studentID = decodedToken.user.studentID
        // Change API function call
        await makePost(`students/enrollClass/${classData.classID}`, {
          studentID,
          message: "I would like to join this class" // Optional message
        })
        // Change notification
        toast.success('Enrollment request sent. Please wait for admin approval.')
        if (chatBoxRef.current) {
          chatBoxRef.current.refreshUsers()
        }
      } else if (decodedToken.user.role == 'Tutor') {
        const tutorId = decodedToken.user.tutorID
        if (tutorId == classData.tutorID) {
          toast.error('You are the tutor of this class!')
        } else {
          toast.error('You are not a student!')
        }
      } else {
        toast.error('User is not a student')
      }
    } catch (error) {
      console.error('Error enrolling in class:', error)
      toast.error(error.response?.data?.message || 'Failed to enroll in class. Please try again.')
    }
  }

  const handleGiveFeedback = () => {
    setShowFeedbackForm(true)
  }

  const handleSaveFeedback = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('You need to log in to provide feedback')
        return
      }

      const decodedToken = jwtDecode(token)
      const studentID = decodedToken.user.studentID

      const response = await makePost(`students/feedback/${id}`, {
        studentID,
        message: feedbackMessage,
        rating,
        date: new Date().toISOString()
      })

      if (response.data) {
        toast.success('Feedback submitted successfully')
        setFeedbackMessage('')
        setShowFeedbackForm(false)
        fetchFeedbacks()
        fetchClass()
      }
    } catch (error) {
      console.error('Error saving feedback:', error)
      toast.error(error.response?.data?.message || 'Failed to save feedback. Please try again.')
    }
  }

  const handleReportClick = () => {
    navigate('/complaint')
  }

  const handleCloseFeedbackForm = () => {
    setShowFeedbackForm(false)
  }

  const handleCloseVideo = () => {
    setShowVideo(false)
  }

  const getYoutubeThumbnail = (url) => {
    if (!url) {
      return '' // Handle undefined or null case
    }

    const videoId = url.split('v=')[1]
    if (!videoId) {
      return '' // Handle invalid video URL
    }

    const ampersandPosition = videoId.indexOf('&')
    if (ampersandPosition !== -1) {
      return `https://img.youtube.com/vi/${videoId.substring(0, ampersandPosition)}/0.jpg`
    }
    return `https://img.youtube.com/vi/${videoId}/0.jpg`
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className='text-yellow-400' />)
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key='half' icon={faStarHalfAlt} className='text-yellow-400' />)
    }

    return stars
  }

  if (!id || loading) {
    return <Loading />
  }

  // Create breadcrumbs with the correct path
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'ClassList', path: '/ClassList' },
    { name: classData?.className || 'Class Detail', path: '#' } // Current page
  ]

  // Determine whether to display the Enroll button
  const showEnrollButton = !isActiveStudent;

  return (
    <div className='min-h-screen bg-gray-100 p-4 pt-12'>
      <header>
        <MegaMenuWithHover />
      </header>
      {classData && (
        <>
          <div className='container mx-auto pl-4 flex flex-col md:flex-row gap-8'>
            <div className='w-full md:w-3/4 mb-4 flex flex-col pt-16'>
              <BreadcrumbsWithIcon pathnames={breadcrumbs} />
            </div>
          </div>

          <div className='container mx-auto p-4 flex flex-col md:flex-row gap-8'>
            <div className='w-full md:w-4/5 mb-4 flex flex-col gap-4'>
              <Card className='shadow-lg w-full relative'>
                <div
                  className='absolute top-4 right-4 cursor-pointer hover:text-red-500'
                  onMouseEnter={() => setIsReportHovered(true)}
                  onMouseLeave={() => setIsReportHovered(false)}
                >
                  <FontAwesomeIcon icon={faFlag} className='h-6 w-6 text-black-500' onClick={handleReportClick} />
                  {isReportHovered && (
                    <span className='absolute right-0 top-full mt-2 w-12 bg-gray-700 text-white text-center text-xs rounded-md py-1'>
                      Report
                    </span>
                  )}
                </div>
                <CardBody className='flex flex-col lg:flex-row sm:flex-col items-start md:items-center gap-5 p-6'>
                  <div className='w-full md:w-full mt-4 lg:mt-0 lg:w-1/2'>
                    <div
                      className={`relative ${getYoutubeThumbnail(classData.videoLink) ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (!!getYoutubeThumbnail(classData.videoLink)) {
                          setShowVideo(true)
                        }
                      }}
                    >
                      <img
                        src={getYoutubeThumbnail(classData.videoLink) || altImageThumbnail}
                        alt='Video Thumbnail'
                        className='w-full h-auto rounded-lg'
                      />
                      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                        <FontAwesomeIcon
                          icon={faPlay}
                          className='h-16 w-16 text-white opacity-75 cursor-pointer hover:opacity-100'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='w-full md:w-full lg:w-1/2'>
                    <Typography variant='h4' className='mb-4'>
                      {classData.className}
                    </Typography>
                    <Typography tag='h3' className='mb-4' style={{ wordWrap: 'break-word' }}>
                      {classData.description}
                    </Typography>
                    <Typography tag='h3' className='mb-2 blue'>
                      <Link to={`/tutor-profile/${classData.userID}`} className='block'>
                        <strong>Tutor:</strong>{' '}
                        <span style={{ fontWeight: 'bold', color: 'black' }}> {classData.tutorFullName} </span>
                      </Link>
                    </Typography>
                    <Typography tag='h3' className='mb-2'>
                      <strong>Subject:</strong> {classData.subject}
                    </Typography>
                    <Typography tag='h3' className='mb-2'>
                      <strong>Rating of tutor:</strong> {renderStars(classData.rating)}
                    </Typography>
                    <Typography tag='h3' className='mb-2'>
                      <strong>Last for:</strong> {classData.length}
                    </Typography>
                    <Typography tag='h3' className='mb-2'>
                      <strong>Available:</strong> {classData.available}
                    </Typography>
                    <Typography tag='h3' className='mb-2'>
                      <strong>Price per hour:</strong> {formatVND(classData.price)} VND
                    </Typography>
                    <div className='flex gap-4'>
                      {showEnrollButton && (
                        <Button className='w-50' onClick={handleEnrollNow} disabled={isEnrolled || showFeedbackForm}>
                          {isEnrolled ? 'Enrolled' : 'Enroll now'}
                        </Button>
                      )}
                      {isActiveStudent && (
                        <Button
                          className='w-50 bg-green-500'
                          disabled={true}
                        >
                          Already Enrolled
                        </Button>
                      )}
                      {isActiveStudent && (
                        <Button
                          className='w-50'
                          onClick={showFeedbackForm ? handleCloseFeedbackForm : handleGiveFeedback}
                        >
                          {showFeedbackForm ? 'Close' : 'Give feedback'}
                        </Button>
                      )}
                    </div>
                    {enrollError && (
                      <Typography tag='h3' className='text-red-600 mt-2'>
                        {enrollError}
                      </Typography>
                    )}
                  </div>
                </CardBody>
              </Card>

              {showFeedbackForm && (
                <Card className='shadow-lg w-full mt-4'>
                  <CardBody>
                    <textarea
                      className='border border-gray-300 rounded-md p-2 w-full mb-2'
                      placeholder='Write your feedback...'
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                    />
                    Rating: <StarRating initialRating={rating} onRate={handleRatingChange} />
                    <Button onClick={handleSaveFeedback} className='ml-2'>
                      Save
                    </Button>
                  </CardBody>
                </Card>
              )}

              <Card className='shadow-lg w-full mt-4'>
                <CardBody>
                  <Typography variant='h3' className='mb-2'>
                    All reviews
                  </Typography>
                  {feedbacks && feedbacks.length > 0 ? (
                    feedbacks.map((feedback, index) => (
                      <Card key={index} className='p-3 mb-3'>
                        <div className='flex items-center mb-2'>
                          <CircularImg
                            avatar={
                              feedback.studentAvatar ||
                              'https://cdn.iconscout.com/icon/free/png-256/free-incognito-6-902117.png?f=webp&w=256'
                            }
                          />
                          <div className='ml-2'>
                            <Typography variant='paragraph'>
                              <span style={{ fontWeight: 'bold' }}>{feedback.studentName}</span>
                            </Typography>
                            <Typography tag='h3' className='text-gray-500'>
                              {new Date(feedback.feedbackDate).toLocaleDateString()}
                            </Typography>
                            <Typography tag='h3' className='text-gray-500'>
                              {renderStars(feedback.rating)}
                            </Typography>
                            <Typography variant='paragraph'>{feedback.message}</Typography>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-4">
                      <Typography variant="paragraph" className="text-gray-500">
                        No reviews yet. Be the first to leave a review!
                      </Typography>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>

          {showVideo && (
            <div
              className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center'
              onClick={handleCloseVideo}
            >
              <div className='relative w-full h-full max-w-screen-lg'>
                <div className='absolute m-4 cursor-pointer text-orange-200 z-10 lg:top-24 md:top-24 top-52 right-0 sm:top-34'>
                  <FontAwesomeIcon icon={faTimes} className='h-8 w-8' onClick={handleCloseVideo} />
                </div>
                <iframe
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 object-cover aspect-video'
                  width='100%'
                  src={`https://www.youtube.com/embed/${classData.videoLink.split('v=')[1]}`}
                  title='YouTube Video Player'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </>
      )}
      <ToastContainer />
    </div>
  )
}

export default ClassDetail