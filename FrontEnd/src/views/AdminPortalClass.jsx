import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import AccessDeniedPage from '../components/AccessDeniedPage.jsx'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeDelete, makeGet, makePostFormData, makePutFormData, makePost } from '../apiService/httpService.js'
import { formatVND } from '../utils/format.js'
import StarRating, { ReadonlyStarRating } from '../components/StarRating.jsx'
import supabase from '../apiService/supabase.js'
const AdminPortalClass = () => {
  const [classes, setClasses] = useState([])
  const [allClasses, setAllClasses] = useState([])
  const [tutors, setTutors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [classesPerPage, setClassesPerPage] = useState(10)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [currentClassForStudents, setCurrentClassForStudents] = useState(null)

  // Form data for class
  const [formData, setFormData] = useState({
    className: '',
    videoLink: '',
    subject: '',
    tutorID: '',
    length: 0,
    available: 1,
    type: 'Live',
    description: '',
    price: 0,
    isActive: 1
  })

  // Refs for file uploads
  const videoRef = useRef(null)

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token || role !== 'Admin') {
    return <AccessDeniedPage />
  }

  useEffect(() => {
    fetchClasses()
    fetchTutors()
    fetchStudent()

    // Add event listener to track screen size
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Adjust number of classes displayed based on screen size
      if (window.innerWidth < 640) {
        setClassesPerPage(5)
      } else if (window.innerWidth < 1024) {
        setClassesPerPage(8)
      } else {
        setClassesPerPage(10)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call on component mount

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const fetchClasses = async () => {
    makeGet('admin/classList')
      .then((response) => {
        setClasses(response.data)
        setAllClasses(response.data)
      })
      .catch((error) => {
        console.error('Error fetching classes:', error)
        toast.error('Could not load class list')
      })
  }

  const fetchTutors = async () => {
    makeGet('admin/getUser')
      .then((response) => {
        // Filter only users with Tutor role and active status
        const tutorsList = response.data.filter((user) => user.role === 'Tutor' && user.isActive === 1)
        console.log(tutorsList)

        setTutors(tutorsList)
      })
      .catch((error) => {
        console.error('Error fetching tutors list:', error)
        toast.error('Could not load tutor list')
      })
  }

  const fetchStudent = async () => {
    makeGet('students/getAllStudents')
      .then((response) => {
        setStudents(response.data)
      })
      .catch((error) => {
        console.error('Error fetching student list:', error)
        toast.error('Could not load student list')
      })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim() !== '') {
      const filteredClasses = allClasses.filter((classItem) =>
        classItem.className.toLowerCase().includes(value.toLowerCase())
      )
      setClasses(filteredClasses)
    } else {
      // Reset classes list if search term is empty
      setClasses(allClasses)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target

    // Handle numeric fields specially
    if (name === 'price' || name === 'length') {
      setFormData({
        ...formData,
        [name]: Number(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const openAddModal = () => {
    setEditingClass(null)
    setFormData({
      className: '',
      videoLink: '',
      subject: '',
      tutorID: '',
      length: 0,
      available: 1,
      type: 'Live',
      description: '',
      price: 0,
      isActive: 1
    })

    // Reset file input
    if (videoRef.current) videoRef.current.value = ''

    setIsModalOpen(true)
  }

  const openEditModal = (classItem) => {
    setEditingClass(classItem)

    setFormData({
      classID: classItem.classID,
      className: classItem.className || '',
      videoLink: classItem.videoLink || '',
      subject: classItem.subject || '',
      tutorID: classItem.tutorID || '',
      length: classItem.length || 0,
      available: classItem.available || 1,
      type: classItem.type || 'Live',
      description: classItem.description || '',
      price: classItem.price || 0,
      isActive: classItem.isActive ? 1 : 0
    })

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClass(null)
  }

  const openStudentModal = (classItem) => {
    setCurrentClassForStudents(classItem)
    setSelectedStudents([])
    setIsStudentModalOpen(true)
  }

  const closeStudentModal = () => {
    setIsStudentModalOpen(false)
    setCurrentClassForStudents(null)
  }

  const handleSelectStudent = (student) => {
    const isAlreadySelected = selectedStudents.some((s) => s.userID === student.userID)

    if (isAlreadySelected) {
      setSelectedStudents(selectedStudents.filter((s) => s.userID !== student.userID))
    } else {
      setSelectedStudents([...selectedStudents, student])
    }
  }

  const removeSelectedStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter((student) => student.userID !== studentId))
  }

  const handleSubmitStudents = async (e) => {
    e.preventDefault()
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    const res = await makePost(`admin/assignStudents/${currentClassForStudents.classID}`, {
      studentIDs: selectedStudents.map((student) => student.studentID)
    })

    makePost(`admin/handleAssignStudent`, {
      classID: currentClassForStudents.classID,
      studentIDs: selectedStudents.map((student) => student.studentID)
    })
    if (res) {
      const insertStudents = selectedStudents.map((student) => ({
        chat_room_id: currentClassForStudents.classID,
        role: 'Student',
        user_id: student.userID,
        user_name: student.userName
      }))

      const { data, error } = await supabase.from('chat_room_members').insert(insertStudents).select()
      if (error) {
        console.error('failed to create chat room tutor:', error)
        throw new Error('can not create class chat room tutor')
      }
    }
    console.log(`Adding the following students to class ${currentClassForStudents?.className}:`, selectedStudents)
    toast.success(`Successfully added ${selectedStudents.length} students to the class`)
    closeStudentModal()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingClass) {
        // Update class
        const res = await makePostFormData(`tutors/updateClasses/${editingClass.classID}`, formData)
        if (res) {
          const updateRoom = {
            name: formData.className,
            tutor_id: formData.tutorID,
            class_id: +res.data.classID
          }
          const { data, error } = await supabase
            .from('chat_rooms')
            .update(updateRoom)
            .eq('class_id', +res.data.classID)
            .select()
          if (error) {
            console.error('failed to update chat room:', error)
            throw new Error('can not update class chat room')
          }
        }
        toast.success('Class updated successfully')
      } else {
        // Create FormData for file uploads
        const formDataToSend = new FormData()

        // Add basic fields
        for (const key in formData) {
          formDataToSend.append(key, formData[key])
        }

        // Add video if present
        if (videoRef.current && videoRef.current.files[0]) {
          formDataToSend.append('video', videoRef.current.files[0])
        }

        // Call API to create new class
        const res = await makePostFormData('tutors/createClasses', formDataToSend)
        const updateRoom = {
          name: formData.className,
          tutor_id: formData.tutorID,
          class_id: +res.data.classID
        }
        const { data, error } = await supabase.from('chat_rooms').insert([updateRoom]).select()
        if (error) {
          console.error('failed to create chat room:', error)
          throw new Error('can not create class chat room')
        }
        if (data) {
          const user_id = tutors.find((t) => t.tutorID === res.data.tutorID)?.userID
          const user_name = tutors.find((t) => t.tutorID === res.data.tutorID)?.userName
          const { data, error } = await supabase
            .from('chat_room_members')
            .insert([
              {
                chat_room_id: res.data.classID,
                role: 'Tutor',
                user_id: user_id,
                user_name: user_name
              }
            ])
            .select()
          if (error) {
            console.error('failed to create chat room tutor:', error)
            throw new Error('can not create class chat room tutor')
          }
        }
        toast.success('New class created successfully')
      }

      closeModal()
      fetchClasses() // Refresh class list
    } catch (error) {
      console.error('Error saving data:', error)
      toast.error(error.message || 'Error saving data')
    }
  }

  const deleteClass = (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      makeDelete(`admin/deleteClass/${id}`)
        .then((response) => {
          toast.success('Class deleted successfully')
          fetchClasses() // Refresh list
        })
        .catch((error) => {
          console.error('Error deleting class:', error)
          toast.error('Could not delete class')
        })
    }
  }

  const videoUrlField = (link) =>
    link && link.length > 0 ? (
      <a href={link} target='_blank' rel='noopener noreferrer' className='text-blue-500 hover:underline'>
        View video
      </a>
    ) : (
      <span className='text-gray-400'>No video</span>
    )

  // Calculate pagination
  const totalPages = Math.ceil(classes.length / classesPerPage)

  // Get current classes
  const indexOfLastClass = currentPage * classesPerPage
  const indexOfFirstClass = indexOfLastClass - classesPerPage
  const currentClasses = classes.slice(indexOfFirstClass, indexOfLastClass)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className='mx-auto p-3 md:p-6 bg-gray-100 min-h-screen'>
      <ToastContainer position='top-right' />
      <header className='bg-purple-600 text-white shadow-md py-4'>
        <MegaMenuWithHover />
      </header>
      <div className='pt-16 md:pt-20'>
        <h1 className='text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-center text-black'>Admin Portal - Classes</h1>

        <div className='flex flex-col md:flex-row justify-between mb-4 md:mb-6 space-y-3 md:space-y-0'>
          <div className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto'>
            <input
              type='text'
              value={searchTerm}
              onChange={handleInputChange}
              className='border border-gray-400 p-2 rounded-lg md:max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='Search by class name'
            />
          </div>

          <button
            onClick={openAddModal}
            className='bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300'
          >
            New
          </button>
        </div>

        <div className='overflow-x-auto rounded-lg shadow'>
          <table className='min-w-full bg-white'>
            <thead className='bg-gradient-to-t from-yellow-700 to-yellow-300 text-black'>
              <tr>
                <th className='p-2 md:p-4 text-left'>Class ID</th>
                <th className='p-2 md:p-4 text-left'>Class Name</th>
                <th className='p-2 md:p-4 text-left'>Video</th>
                <th className='p-2 md:p-4 text-left'>Tutor Name</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Subject</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Length</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Type</th>
                <th className='p-2 md:p-4 text-left'>Price</th>
                <th className='p-2 md:p-4 text-left'>Active</th>
                <th className='p-2 md:p-4 text-left'>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentClasses.map((classItem, index) => (
                <tr key={classItem.classID} className='border-b hover:bg-purple-50'>
                  <td className='p-2 md:p-4'>{classItem.classID}</td>
                  <td className='p-2 md:p-4'>{classItem.className}</td>
                  <td className='p-2 md:p-4'>{videoUrlField(classItem.videoLink)}</td>
                  <td className='p-2 md:p-4'>{classItem.tutorFullName}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{classItem.subject}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{classItem.length} minutes</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{classItem.type}</td>
                  <td className='p-2 md:p-4'>{formatVND(classItem.price)}</td>
                  <td className='p-2 md:p-4'>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs md:text-sm ${
                        classItem.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='p-2 md:p-4'>
                    <div className='flex flex-col md:flex-row gap-1 md:gap-2'>
                      <button
                        onClick={() => openStudentModal(classItem)}
                        className='text-xs md:text-sm p-1 md:p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-300'
                      >
                        Assigned student
                      </button>
                      <button
                        onClick={() => openEditModal(classItem)}
                        className='text-xs md:text-sm p-1 md:p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300'
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteClass(classItem.classID)}
                        className='text-xs md:text-sm p-1 md:p-2 rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors duration-300'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex justify-center items-center mt-6 flex-wrap'>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            «
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1
            const showPageButton =
              pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)

            if (pageNum === currentPage - 2 && currentPage > 3) {
              return (
                <span key={`ellipsis-prev`} className='mx-1'>
                  ...
                </span>
              )
            }

            if (pageNum === currentPage + 2 && currentPage < totalPages - 2) {
              return (
                <span key={`ellipsis-next`} className='mx-1'>
                  ...
                </span>
              )
            }

            if (showPageButton) {
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === pageNum ? 'bg-purple-700 text-white' : 'bg-purple-200 hover:bg-purple-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }

            return null
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            »
          </button>

          <select
            value={classesPerPage}
            onChange={(e) => {
              setClassesPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className='ml-4 border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-purple-500'
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4'>
          <div className='bg-white rounded-lg p-4 md:p-8 w-full max-w-md md:max-w-xl mx-auto my-4 md:my-6 max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl md:text-2xl font-bold mb-4 text-center'>
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='space-y-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Class Name</label>
                    <input
                      type='text'
                      name='className'
                      value={formData.className}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Subject</label>
                    <input
                      type='text'
                      name='subject'
                      value={formData.subject}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-1'>Video Link</label>
                  <input
                    type='text'
                    name='videoLink'
                    value={formData.videoLink}
                    onChange={handleFormChange}
                    className='w-full border border-gray-300 rounded-md p-2 text-sm'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Tutor</label>
                    <select
                      name='tutorID'
                      value={formData.tutorID}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
                      required
                    >
                      <option value=''>-- Select tutor --</option>
                      {tutors.map((tutor) => (
                        <option key={tutor.userID} value={tutor.tutorID || tutor.userID}>
                          {tutor.fullName} ({tutor.userName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Length (minutes)</label>
                    <input
                      type='number'
                      name='length'
                      value={formData.length}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Type</label>
                    <select
                      name='type'
                      value={formData.type}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
                      required
                    >
                      <option value='Live'>Live</option>
                      <option value='Record'>Record</option>
                      <option value='Hybrid'>Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Status</label>
                    <select
                      name='isActive'
                      value={formData.isActive}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Price</label>
                    <input
                      type='number'
                      name='price'
                      value={formData.price}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Max Students</label>
                    <input
                      type='number'
                      name='available'
                      value={formData.available}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-1'>Description</label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleFormChange}
                    className='w-full border border-gray-300 rounded-md p-2 text-sm'
                    rows='3'
                    required
                  ></textarea>
                </div>

                {/* {!editingClass && (
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Video File (optional)</label>
                    <input
                      type='file'
                      accept='video/*'
                      ref={videoRef}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                    />
                  </div>
                )} */}
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-300 text-sm'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-300 text-sm'
                >
                  {editingClass ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {isStudentModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4'>
          <div className='bg-white rounded-lg p-4 md:p-8 w-full max-w-md md:max-w-2xl mx-auto my-4 md:my-6 max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl md:text-2xl font-bold mb-4 text-center'>
              Assign Students to {currentClassForStudents?.className}
            </h2>
            <form onSubmit={handleSubmitStudents}>
              <div className='space-y-4'>
                {/* Available Students List */}
                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Available Students</label>
                  <div className='max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2'>
                    {students.map((student) => (
                      <div
                        key={student.userID}
                        className={`flex items-center p-2 cursor-pointer ${
                          selectedStudents.some((s) => s.userID === student.userID) ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => handleSelectStudent(student)}
                      >
                        <input
                          type='checkbox'
                          checked={selectedStudents.some((s) => s.userID === student.userID)}
                          onChange={() => handleSelectStudent(student)}
                          className='mr-2'
                        />
                        <div>
                          <p className='font-medium'>{student.fullName}</p>
                          <p className='text-sm text-gray-500'>{student.email}</p>
                          <p className='text-sm text-gray-500'>Grade: {student.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Selected Students List */}
                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-2'>Selected Students</label>
                  <div className='min-h-[100px] border border-gray-300 rounded-md p-2'>
                    {selectedStudents.length === 0 ? (
                      <p className='text-gray-500 text-sm'>No students selected</p>
                    ) : (
                      <div className='flex flex-wrap gap-2'>
                        {selectedStudents.map((student) => (
                          <div
                            key={student.userID}
                            className='flex items-center bg-purple-100 rounded-full px-3 py-1 text-sm'
                          >
                            <span>{student.fullName}</span>
                            <button
                              type='button'
                              onClick={() => removeSelectedStudent(student.userID)}
                              className='ml-2 text-red-500 hover:text-red-700'
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  type='button'
                  onClick={closeStudentModal}
                  className='bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-300 text-sm'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-300 text-sm'
                >
                  Assign Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className='fixed bottom-4 right-4 md:hidden z-40'>
        <button
          onClick={openAddModal}
          className='bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-colors'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
          </svg>
        </button>
      </div>

      {/* Loading Indicator */}
      {classes.length === 0 && allClasses.length === 0 && (
        <div className='flex justify-center items-center mt-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
          <p className='ml-3 text-purple-500'>Loading data...</p>
        </div>
      )}

      {/* Empty State */}
      {allClasses.length > 0 && classes.length === 0 && (
        <div className='bg-white p-8 rounded-lg shadow text-center mt-10'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='w-16 h-16 text-gray-400 mx-auto mb-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='text-xl font-medium text-gray-700 mb-2'>No classes found</h3>
          <p className='text-gray-500 mb-4'>No classes match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('')
              fetchClasses()
            }}
            className='bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors'
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className='fixed bottom-4 left-4 bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors opacity-70 hover:opacity-100'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          className='w-5 h-5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 15l7-7 7 7' />
        </svg>
      </button>
    </div>
  )
}

export default AdminPortalClass
