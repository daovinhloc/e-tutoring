import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Typography, Button } from '@material-tailwind/react'

const ClassCard = ({
  id,
  imageLink,
  title,
  tutor,
  description,
  lectures,
  rating,
  price,
  setEditClass,
  deleteClass,
  managementMode = false // Optional prop to enable management UI
}) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/card/${id}`, {
      state: {
        id,
        imageLink,
        title,
        tutor,
        description,
        lectures,
        rating,
        price
      }
    })
  }

  return (
    <Card className='mt-6 w-80 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl'>
      <CardHeader color='blue-gray' className='relative h-48'>
        <img src={imageLink} alt='card-image' className='h-full w-full object-cover' />
      </CardHeader>
      <CardBody>
        <Typography variant='h5' color='blue-gray'>
          {title}
        </Typography>
        <Typography className='mb-3'>{description}</Typography>
        <Typography color='blue-gray' className='flex items-center gap-1.5 font-normal'>
          <Typography>Tutor:</Typography>
          {tutor}
        </Typography>
        <Typography color='blue-gray' className='flex items-center gap-1.5 font-normal'>
          <Typography>Rating:</Typography>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='-mt-0.5 h-5 w-5 text-yellow-700'
          >
            <path
              fillRule='evenodd'
              d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z'
              clipRule='evenodd'
            />
          </svg>
          {rating}
        </Typography>
        <Typography color='blue-gray' className='flex items-center gap-1.5 font-normal'>
          <Typography>Available:</Typography>/{lectures} lectures
        </Typography>
      </CardBody>
      {managementMode && (
        <CardFooter className='pt-0 flex items-center justify-between'>
          <Button onClick={() => setEditClass({ id, imageLink, title, tutor, description, lectures, rating, price })}>
            Edit
          </Button>
          <Button onClick={() => deleteClass(id)} color='red'>
            Delete
          </Button>
        </CardFooter>
      )}
      {!managementMode && (
        <CardFooter className='pt-0 flex items-center justify-between'>
          <Button onClick={handleCardClick}>Enroll</Button>
          <Typography color='blue-gray' className='flex items-center gap-1.5 font-normal'>
            <Typography>Price per hour:</Typography>
            {`${price} VND`}
          </Typography>
        </CardFooter>
      )}
    </Card>
  )
}

export default ClassCard
