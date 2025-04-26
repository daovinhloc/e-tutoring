import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Link, useNavigate } from 'react-router-dom'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AccessDeniedPage from '../components/AccessDeniedPage.jsx'
import { Button } from '@material-tailwind/react'
import { ChatBubbleLeftIcon, NewspaperIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { makeDelete, makeGet, makePost, makePut } from '../apiService/httpService.js'
import supabase from '../apiService/supabase.js'
import AuthContext from '../contexts/JWTAuthContext'

const ClassManagement = () => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const { user, isAuthenticated } = useContext(AuthContext)
  const [classes, setClasses] = useState([])
  const [inactiveClasses, setInactiveClasses] = useState([])
  const [formData, setFormData] = useState({
    videoLink: '',
    className: '',
    tutorID: '',
    description: '',
    price: '',
    subject: '',
    PaymentID: 0,
    length: '',
    available: '',
    type: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateFormData, setUpdateFormData] = useState(formData)
  const [currentClassId, setCurrentClassId] = useState(null)
  const hasCheckedPayment = useRef(false)
  const [chatRooms, setChatRooms] = useState([])
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-menu')) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  if (!token || !role || role == 'Student') {
    return <AccessDeniedPage />
  }

  const getChatRoomsByTutorId = async () => {
    if (user && user.role === 'Tutor') {
      const { data, error } = await supabase.from('chat_rooms').select('*').eq('tutor_id', user.tutorID)
      if (error) {
        toast.error('Can not get chat rooms')
        return []
      }
      setChatRooms(data)
    }
  }
  useEffect(() => {
    if (role == 'Tutor') {
      fetchClasses()
      getChatRoomsByTutorId()
    }
  }, [token, role])

  useEffect(() => {
    if (!hasCheckedPayment.current) {
      handleReturnFromPayment()
      hasCheckedPayment.current = true // Set the flag to true after running the function
    }
  }, [])

  const fetchClasses = async () => {
    try {
      if (!token) {
        toast.error('User is not logged in')
        return
      }
      const decodedToken = jwtDecode(token)
      const tutorID = decodedToken.user.tutorID
      const response = await makePost(`tutors/findClasses/${tutorID}`)
      const activeClasses = response.classroom.filter((classroom) => classroom.isActive)
      const inactiveClasses = response.classroom.filter((classroom) => classroom.isActive == 0)
      setClasses(activeClasses)
      setInactiveClasses(inactiveClasses)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const handleDeactivateClass = async (classID) => {
    try {
      await makeDelete(`tutors/deleteClasses/${classID}`)
      toast('Class deactivate successfully!')
      fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('There was an error deactivating the class.')
    }
  }

  const handleActivateClass = async (classID) => {
    try {
      await makePut(`tutors/activeClasses/${classID}`)
      toast('Class activate successfully!')
      fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('There was an error activating the class.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericValue = name === 'PaymentID' && value !== '' ? parseInt(value, 10) : value
    setFormData({
      ...formData,
      [name]: numericValue
    })
  }

  const handleUpdateChange = (e) => {
    const { name, value } = e.target
    const numericValue = name === 'PaymentID' && value !== '' ? parseInt(value, 10) : value
    setUpdateFormData({
      ...updateFormData,
      [name]: numericValue
    })
  }

  const validateForm = (data) => {
    const requiredFields = [
      'videoLink',
      'className',
      'subject',
      'description',
      'available',
      'length',
      'PaymentID',
      'type',
      'price'
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        if (field == 'PaymentID') return `Please fill in the Subcription field.`
        return `Please fill in the ${field} field.`
      }
    }
    return null
  }

  const classPrices = {
    1: 2000, // Standard Tutor Class
    2: 4000, // Pro Tutor Class
    3: 6000 // Enterprise Tutor Class
  }

  const classTypes = {
    1: 'Standard Tutor Class',
    2: 'Pro Tutor Class',
    3: 'Premium Tutor Class'
  }

  const handleAddClass = async () => {
    try {
      // alert
      const validationError = validateForm(formData)
      if (validationError) {
        toast.error(validationError)
        return
      }
      const priceValidate = parseInt(formData.price)
      if (priceValidate < 10000 || priceValidate > 50000) {
        toast.error('Please fill in the price field from 10 000 VND to 50 000 VND.')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('User is not logged in')
        return
      }
      const decodedToken = jwtDecode(token)
      const tutorID = decodedToken.user.tutorID
      formData.tutorID = tutorID

      const price = classPrices[formData.PaymentID]
      const classType = classTypes[formData.PaymentID]
      const paymentUrl = await axios.post('http://localhost:5000/api/createPayment', {
        description: 'Thanh toan don hang',
        items: [
          {
            name: classType,
            quantity: 1,
            price: price
          }
        ],
        classes: formData
      })

      localStorage.setItem('pendingOrderID', paymentUrl.data.orderID)
      localStorage.setItem('pendingClassData', JSON.stringify(formData))
      setIsModalOpen(false)
      toast.info('Wait for payment before create class!')
      const checkout = paymentUrl.data.checkoutUrl
      window.location.href = checkout
    } catch (error) {
      console.error('Error adding class:', error)
      toast.error('There was an error creating the class.')
    }
  }

  const handleReturnFromPayment = async () => {
    try {
      const orderID = localStorage.getItem('pendingOrderID')
      const pendingClassData = JSON.parse(localStorage.getItem('pendingClassData'))

      if (!orderID || !pendingClassData) {
        console.error('No pending order or class data found.')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('User is not logged in')
        return
      }
      const decodedToken = jwtDecode(token)
      const tutorID = decodedToken.user.tutorID
      //xac minh thanh toan voi may chu
      const paymentVerificationResponse = await axios.post(`http://localhost:5000/api/checkPayment/${orderID}`, {
        tutorID
      })

      if (paymentVerificationResponse.data.success) {
        const response = await makePost(`tutors/createClasses`, pendingClassData)
        setClasses([...classes, response.data])

        setFormData({
          videoLink: '',
          className: '',
          tutorID: '',
          description: '',
          price: '',
          subject: '',
          PaymentID: 1, // Default PaymentID
          length: '',
          available: '',
          type: 'Online'
        })

        localStorage.removeItem('pendingOrderID')
        localStorage.removeItem('pendingClassData')
        toast.info('Class created successfully!')
        fetchClasses()
      } else {
        localStorage.removeItem('pendingOrderID')
        localStorage.removeItem('pendingClassData')
        toast.error('Payment verification failed.')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    }
  }

  const handleOpenUpdateModal = (cls) => {
    setCurrentClassId(cls.classID)
    setUpdateFormData({
      videoLink: cls.videoLink,
      className: cls.className,
      tutorID: cls.tutorID,
      description: cls.description,
      price: cls.price,
      subject: cls.subject,
      PaymentID: cls.paymentID,
      length: cls.length,
      available: cls.available,
      type: cls.type === 'Online' ? 'Online' : 'Offline'
    })
    setIsUpdateModalOpen(true)
  }
  const handleUpdateChatRoom = async (cls) => {
    const updateRoom = {
      name: cls.className,
      tutor_id: cls.tutorID,
      class_id: +cls.classID
    }

    const { data, error } = await supabase.from('chat_rooms').update(updateRoom).eq('class_id', cls.classID).select()

    if (error) {
      console.error('failed to update chat room:', error)
      throw new Error('can not update class chat room')
    }

    return data[0]
  }

  const handleUpdateClass = async () => {
    try {
      const validationError = validateForm(updateFormData)
      if (validationError) {
        toast.error(validationError)
        return
      }

      const response = await makePost(`tutors/updateClasses/${currentClassId}`, updateFormData)
      setClasses(classes.map((cls) => (cls.id === currentClassId ? response.data : cls)))
      handleUpdateChatRoom({
        className: updateFormData.className,
        tutorID: updateFormData.tutorID,
        classID: currentClassId
      })
      setIsUpdateModalOpen(false)
      toast.info('Class updated successfully!')
      fetchClasses()
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error('There was an error updating the class.')
    }
  }

  const handleUnenrollStudent = async (classID, studentID) => {
    try {
      await makePost(`tutors/unEnrollClass/${classID}`, { studentID })
      // await axios.post(`http://localhost:5000/api/students/unEnrollClass/${classID}`, { studentID })
      toast('Student unenrolled successfully!')
      fetchClasses()
    } catch (error) {
      console.error('Error unenrolling student:', error)
      toast.error('There was an error unenrolling the student.')
    }
  }

  const renderUnenrollButton = (classID, studentID) => {
    if (studentID) {
      return (
        <button
          onClick={() => handleUnenrollStudent(classID, studentID)}
          className='bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2'
        >
          Unenroll
        </button>
      )
    }
    return null
  }

  const handleAddChatRoom = async (cls) => {
    const newRoom = {
      name: cls.className,
      tutor_id: cls.tutorID,
      class_id: +cls.classID
    }
    const { data, error } = await supabase.from('chat_rooms').insert([newRoom]).select()
    if (error) {
      toast.error('Can not create new chat room')
      return
    } else {
      const { data, error } = await supabase
        .from('chat_room_members')
        .insert([
          {
            chat_room_id: +cls.classID,
            role: 'Tutor',
            user_id: user.userID,
            user_name: user.userName
          }
        ])
        .select()
      if (error) {
        toast.error('Can not create new chat room')
        return
      } else {
        getChatRoomsByTutorId()
      }
    }
    toast.success('Create chat room success')
  }

  return (
    <div className='container mx-auto p-4 pt-16'>
      <header>
        <MegaMenuWithHover />
      </header>
      <div className='mx-auto mt-10'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Class Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className='bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mb-4'
        >
          Add New Class
        </button>
        <div className='grid grid-cols-1 gap-4'>
          {classes.map((cls) => (
            <div
              key={cls.classID}
              className='flex flex-col justify-between items-center p-4 border rounded shadow md:flex-row lg:flex-row'
            >
              <div className='mb-2 text-left w-full'>
                <h2 className='text-lg font-bold'>{cls.className}</h2>
                <p className='text-sm mb-2'>Subject: {cls.subject}</p>
              </div>
              {/* <div className='w-full text-right'>
                {renderUnenrollButton(cls.classID, cls.studentID)}
                <Link
                  to={`/classroom?room=${encodeURIComponent(cls.className)}&name=${encodeURIComponent(
                    localStorage.getItem('userName') || 'Tutor'
                  )}`}
                  className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2'
                >
                  Create Class
                </Link>
                <Link
                  to={`/my-classes/${cls.classID}/blogs`}
                  className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2'
                >
                  <span>Blogs</span>
                </Link>
                <Link
                  to={`/my-classes/${cls.classID}/stream`}
                  className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2'
                >
                  Stream
                </Link>
                <button
                  onClick={() => handleOpenUpdateModal(cls)}
                  className='bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 mr-2'
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeactivateClass(cls.classID)}
                  className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700'
                >
                  Deactivate
                </button>
              </div> */}
              <div className='w-full text-right relative'>
                <div className='inline-flex gap-2 items-center'>
                  {renderUnenrollButton(cls.classID, cls.studentID)}

                  <Link
                    to={`/classroom?room=${encodeURIComponent(cls.className)}&name=${encodeURIComponent(
                      localStorage.getItem('userName') || 'Tutor'
                    )}`}
                    className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600'
                  >
                    Create Class
                  </Link>

                  <div className='relative inline-block text-left'>
                    <button
                      onClick={() => setOpenMenu((open) => (open === cls.classID ? null : cls.classID))}
                      className='bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300'
                    >
                      More ⋮
                    </button>

                    {openMenu === cls.classID && (
                      <div className='absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-10 dropdown-menu'>
                        <Link to={`/my-classes/${cls.classID}/blogs`} className='block px-4 py-2 hover:bg-gray-100'>
                          Blogs
                        </Link>
                        <Link to={`/my-classes/${cls.classID}/stream`} className='block px-4 py-2 hover:bg-gray-100'>
                          Stream
                        </Link>
                        <button
                          onClick={() => handleOpenUpdateModal(cls)}
                          className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeactivateClass(cls.classID)}
                          className='block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100'
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className='text-xl font-bold mb-4 mt-8 text-center'>Inactive Classes</h2>
        </div>
        <div className='grid grid-cols-1 gap-4'>
          {inactiveClasses.map((cls) => (
            <div key={cls.classID} className='flex justify-between items-center p-4 border rounded shadow'>
              <div>
                <h2 className='text-lg font-bold'>{cls.className}</h2>
                <p className='text-sm'>Subject: {cls.subject}</p>
              </div>
              <div>
                <button
                  onClick={() => handleActivateClass(cls.classID)}
                  className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700'
                >
                  Activate
                </button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-8 rounded shadow-lg w-1/2 max-h-[80vh] overflow-y-auto mt-20'>
              <h2 className='text-xl font-bold mb-4 text-center'>Add New Class</h2>
              <div className='mb-4'>
                <label className='block mb-2'>Video link</label>
                <input
                  type='text'
                  name='videoLink'
                  value={formData.videoLink}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Class name</label>
                <input
                  type='text'
                  name='className'
                  value={formData.className}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Subject included</label>
                <input
                  type='text'
                  name='subject'
                  value={formData.subject}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Description</label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Available on</label>
                <input
                  type='text'
                  name='available'
                  value={formData.available}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Length</label>
                <input
                  type='text'
                  name='length'
                  value={formData.length}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Subscription type:</label>
                <p className='text-sm text-gray-600'>
                  Before choosing the type of subscription, go to our Home Page and scroll down to have a look at the
                  subscription choices.
                </p>
                <select
                  name='PaymentID'
                  value={formData.PaymentID}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value={0} disabled>
                    Select subscription type:
                  </option>
                  <option value={1}>Standard (2000 vnd/class)</option>
                  <option value={2}>Pro (4000 vnd/class)</option>
                  <option value={3}>Enterprise (6000 vnd/class)</option>
                </select>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Type (Online or Offline)</label>
                <select
                  name='type'
                  value={formData.type}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value='' disabled>
                    Select teaching method:
                  </option>
                  <option value='Online'>Online</option>
                  <option value='Offline'>Offline</option>
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Price per hour</label>
                <p className='text-sm text-gray-600'>
                  Please note that price of the classes range from 10 000 VND to 50 000 VND
                </p>
                <input
                  type='number'
                  name='price'
                  value={formData.price}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <button onClick={handleAddClass} className='bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mr-2'>
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isUpdateModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20'>
            <div className='bg-white p-8 rounded shadow-lg w-1/2 max-h-[80vh] overflow-y-auto mt-20'>
              <h2 className='text-xl font-bold mb-4'>Update Class</h2>
              <div className='mb-4'>
                <label className='block mb-2'>Video link</label>
                <input
                  type='text'
                  name='videoLink'
                  value={updateFormData.videoLink}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Class name</label>
                <input
                  type='text'
                  name='className'
                  value={updateFormData.className}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Subject included</label>
                <input
                  type='text'
                  name='subject'
                  value={updateFormData.subject}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Description</label>
                <textarea
                  name='description'
                  value={updateFormData.description}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Available on</label>
                <input
                  type='text'
                  name='available'
                  value={updateFormData.available}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Length</label>
                <input
                  type='text'
                  name='length'
                  value={updateFormData.length}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Subscription type:</label>
                <select
                  name='PaymentID'
                  value={updateFormData.PaymentID}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value='0' disabled>
                    Select subscription type:
                  </option>
                  <option value='1' disabled>
                    Standard (2000 vnd/month)
                  </option>
                  <option value='2' disabled>
                    Pro (4000 vnd/month)
                  </option>
                  <option value='3' disabled>
                    Enterprise (6000 vnd/month)
                  </option>
                </select>
              </div>

              <div className='mb-4'>
                <label className='block mb-2'>Type (Online/Offline)</label>
                <select
                  name='type'
                  value={updateFormData.type}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value='' disabled>
                    Select Type
                  </option>
                  <option value='Online'>Online</option>
                  <option value='Offline'>Offline</option>
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Price per hour</label>
                <input
                  type='number'
                  name='price'
                  value={updateFormData.price}
                  onChange={handleUpdateChange}
                  className='w-full p-2 border border-gray-300 rounded'
                />
              </div>
              <button
                onClick={handleUpdateClass}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2'
              >
                Save
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700'
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default ClassManagement
