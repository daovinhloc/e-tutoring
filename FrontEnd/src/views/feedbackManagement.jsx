import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardBody, Typography, Button } from '@material-tailwind/react'
import { useNavigate } from 'react-router-dom'

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('https://6676c5c6145714a1bd72bec9.mockapi.io/swp/feedbacks')
      setFeedbacks(response.data)
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error)
    }
  }

  const handleViewClick = (id) => {
    navigate(`/classDetail/${id}`)
  }

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`https://6676c5c6145714a1bd72bec9.mockapi.io/swp/feedbacks/${id}`)
      fetchFeedbacks()
    } catch (error) {
      console.error('Failed to delete feedback:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='container mx-auto p-4'>
        <Typography variant='h2' className='mb-4 text-center'>
          Feedback List
        </Typography>
        <div className='grid gap-4'>
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className='shadow-lg mb-4'>
              <CardBody className='p-4'>
                <div className='flex items-center mb-4'>
                  <img
                    src={`https://api.adorable.io/avatars/50/${feedback.studentID}.png`}
                    alt='Student Avatar'
                    className='w-12 h-12 rounded-full mr-4'
                  />
                  <div>
                    <Typography variant='h6' className='font-semibold'>
                      Student ID: {feedback.studentID}
                    </Typography>
                    <Typography className='text-gray-500'>{new Date(feedback.date).toLocaleDateString()}</Typography>
                  </div>
                </div>
                <div className='mb-4'>
                  <Typography variant='h5' className='font-semibold mb-1'>
                    {feedback.className}
                  </Typography>
                  <Typography variant='body1'>{feedback.message}</Typography>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    {[...Array(feedback.rating)].map((_, i) => (
                      <svg key={i} className='w-5 h-5 text-yellow-500' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.078 3.304a1 1 0 00.95.69h3.462c.969 0 1.372 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.078 3.304c.3.921-.755 1.688-1.54 1.118L10 13.417l-2.801 2.034c-.785.57-1.84-.197-1.54-1.118l1.078-3.304a1 1 0 00-.364-1.118L3.573 8.731c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69L9.049 2.927z' />
                      </svg>
                    ))}
                  </div>
                  <div className='flex'>
                    <Button className='w-24 mr-2' onClick={() => handleViewClick(feedback.classId)}>
                      View
                    </Button>
                    <Button className='w-24' color='red' onClick={() => handleDeleteClick(feedback.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeedbackManagement
