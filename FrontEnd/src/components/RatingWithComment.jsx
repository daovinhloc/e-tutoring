import React from 'react'
import { Typography, Avatar, Rating, Card, IconButton, Tooltip } from '@material-tailwind/react'
import { CiFlag1 } from 'react-icons/ci'

function RatingWithComment() {
  // Sample rating comments data (replace this with your actual data)
  const ratingComments = [
    {
      id: 1,
      name: 'John Doe',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Great course! Highly recommended.'
    },
    {
      id: 2,
      name: 'Jane Smith',
      rating: 4,
      date: '1 month ago',
      comment: 'Good content, but could be more interactive.'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      rating: 3,
      date: '3 months ago',
      comment: 'Average course. Expected more.'
    }
    // Add more rating comments here...
  ]

  // Show only the first 3 comments initially
  const initialComments = ratingComments.slice(0, 3)

  return (
    <div className='px-8'>
      <Card className='p-6 border rounded-lg shadow-md relative'>
        <div className='overflow-y-auto max-h-80'>
          {initialComments.map((comment) => (
            <Card key={comment.id} className='mb-4 p-4 relative'>
              <div className='absolute top-2 right-2'>
                <Tooltip content='Report' placement='left' className='border border-blue-gray-50 bg-white text-red'>
                  <IconButton
                    color='white'
                    onClick={() => console.log('Report clicked')}
                    className='hover:bg-gray-200 hover:text-white'
                  >
                    <CiFlag1 size={24} color='red' />
                  </IconButton>
                </Tooltip>
              </div>
              <div className='flex items-start'>
                <Avatar
                  src={`https://via.placeholder.com/150?text=${comment.name}`}
                  alt={comment.name}
                  size='lg'
                  className='mr-4'
                />
                <div className='flex-1'>
                  <Typography variant='h6' className='mt-0'>
                    {comment.name}
                  </Typography>
                  <div className='flex items-center'>
                    <Rating value={comment.rating} readonly />
                    <Typography color='gray' className='ml-2 font-normal'>
                      {comment.date}
                    </Typography>
                  </div>
                  <Typography variant='body1' className='mt-2'>
                    {comment.comment}
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default RatingWithComment
