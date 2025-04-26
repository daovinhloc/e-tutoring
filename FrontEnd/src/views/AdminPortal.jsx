import React, { useState, useEffect, useRef } from 'react'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import AccessDeniedPage from '../components/AccessDeniedPage.jsx'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeDelete, makeGet, makePostFormData, makePut, makePutFormData } from '../apiService/httpService.js'
import axios from 'axios'
import supabase from '../apiService/supabase.js'

const AdminPortal = () => {
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('User') // Default selection is 'User'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(10)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Form data cho cả Student và Tutor
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    role: 'Student',
    phone: '',
    address: '',
    active: 1,
    // Trường cho Student
    grade: '10',
    school: 'Default School',
    // Trường cho Tutor
    workplace: 'Default Workplace',
    description: 'Default Description',
    // URL ảnh đại diện
    avatar: ''
  })

  // Refs cho file uploads
  const avatarRef = useRef(null)
  const degreesRef = useRef(null)
  const identityCardRef = useRef(null)

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token || role !== 'Admin') {
    return <AccessDeniedPage />
  }

  useEffect(() => {
    // Fetch users from the API
    makeGet('admin/getUser')
      .then((response) => {
        setUsers(response.data)
        setAllUsers(response.data)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        toast.error('Can not load users data')
      })

    // Thêm event listener để theo dõi kích thước màn hình
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Điều chỉnh số lượng users hiển thị theo kích thước màn hình
      if (window.innerWidth < 640) {
        setUsersPerPage(5)
      } else if (window.innerWidth < 1024) {
        setUsersPerPage(8)
      } else {
        setUsersPerPage(10)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Gọi ngay khi component mount

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    filterUsers(value, selectedRole)
  }

  const handleRoleChange = (e) => {
    const value = e.target.value
    setSelectedRole(value)

    filterUsers(searchTerm, value)
  }

  const filterUsers = (searchTerm, role) => {
    let filteredUsers = allUsers

    if (searchTerm.trim() !== '') {
      filteredUsers = filteredUsers.filter(
        (user) =>
          (user.userName && user.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (role !== 'User') {
      filteredUsers = filteredUsers?.filter((user) => user.role && user.role.toLowerCase() === role.toLowerCase())
    }

    setUsers(filteredUsers)
    setCurrentPage(1) // Reset về trang đầu tiên khi lọc
  }

  const toggleActiveStatus = (id, isActive) => {
    const newStatus = isActive ? 0 : 1
    const apiUrl = isActive ? `admin/banUsers/${id}` : `admin/unbanUsers/${id}`
    makePut(apiUrl)
      .then((response) => {
        setUsers(users.map((user) => (user.userID === id ? { ...user, isActive: newStatus } : user)))
        toast.success(isActive ? 'User has been banned' : 'Unbanned user')
      })
      .catch((error) => {
        console.error('Error updating user status:', error)
        toast.error('Can not update user data')
      })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${day}/${month}/${year}`
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({
      userName: '',
      fullName: '',
      email: '',
      password: '',
      dateOfBirth: '',
      role: 'Student',
      phone: '',
      address: '',
      active: 1,
      grade: '10',
      school: 'Default School',
      workplace: 'Default Workplace',
      description: 'Default Description',
      avatar: ''
    })

    // Reset các file input
    if (avatarRef.current) avatarRef.current.value = ''
    if (degreesRef.current) degreesRef.current.value = ''
    if (identityCardRef.current) identityCardRef.current.value = ''

    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    console.log('Found user:', user)
    setEditingUser(user)
    // Lấy thông tin cơ bản
    const baseFormData = {
      userID: '',
      userName: user.userName || '',
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      role: user.role || 'Student',
      phone: user.phone || '',
      address: user.address || '',
      active: user.isActive, // Sửa lỗi: sử dụng isActive từ API
      avatar: user.avatar || ''
    }

    // Thêm thông tin đặc biệt dựa theo role
    if (user.role === 'Student') {
      setFormData({
        ...baseFormData,
        grade: user.grade || '10',
        school: user.school || 'Default School'
      })
    } else if (user.role === 'Tutor') {
      setFormData({
        ...baseFormData,
        workplace: user.workplace || 'Default Workplace',
        description: user.description || 'Default Description',
        degrees: user.degrees || '',
        identityCard: user.identityCard || ''
      })
    } else {
      // Cho Admin, Moderator và các role khác
      setFormData(baseFormData)
    }

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const refreshUsersList = () => {
    makeGet('admin/getUser')
      .then((response) => {
        setUsers(response.data)
        setAllUsers(response.data)
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
      })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingUser) {
        // Cập nhật người dùng hiện có
        const res = await makePut(`users/update/${editingUser.userID}`, JSON.stringify({ updatedUserData: formData }))
        const { error: updateErr } = await supabase.auth.updateUser({
          email: formData.email,
          password: formData.password
        })
        if (updateErr) {
          console.log(updateErr.message)
          toast.error('Can not update user in storage')
        }
        toast.success('User update success')
      } else {
        // Tạo FormData để xử lý file uploads
        const formDataToSend = new FormData()

        // Thêm các trường cơ bản
        formDataToSend.append('userName', formData.userName)
        formDataToSend.append('fullName', formData.fullName)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('password', formData.password)
        formDataToSend.append('dateOfBirth', formData.dateOfBirth)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('address', formData.address)

        // Thêm avatar nếu có
        if (avatarRef.current && avatarRef.current.files[0]) {
          formDataToSend.append('avatar', avatarRef.current.files[0])
        } else {
          // Nếu không có file, dùng URL nếu đã nhập
          formDataToSend.append('avatar', formData.avatar || '')
        }

        // Thêm các trường dựa trên role
        if (formData.role === 'Student') {
          formDataToSend.append('grade', formData.grade || '10')
          formDataToSend.append('school', formData.school || 'Default School')

          // Debug log
          console.log('FormData contents:', Object.fromEntries(formDataToSend.entries()))

          // Gọi API
          const res = await makePostFormData('admin/registerStudent', formDataToSend)
          if (res) {
            const { data, error } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password
            })
            if (error) throw new Error('Can not add user to cloud storage!')
          }
        } else if (formData.role === 'Tutor') {
          formDataToSend.append('workplace', formData.workplace || 'Default Workplace')
          formDataToSend.append('description', formData.description || 'Default Description')

          // Thêm file bằng cấp và CMND nếu có
          if (degreesRef.current && degreesRef.current.files[0]) {
            formDataToSend.append('degrees', degreesRef.current.files[0])
          } else {
            formDataToSend.append('degrees', 'default_degree.pdf')
          }

          if (identityCardRef.current && identityCardRef.current.files[0]) {
            formDataToSend.append('identityCard', identityCardRef.current.files[0])
          } else {
            formDataToSend.append('identityCard', 'default_id.pdf')
          }

          // Gọi API đăng ký gia sư
          const res = await makePostFormData('admin/registerTutor', formDataToSend)
          if (res) {
            const { data, error } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password
            })
            if (error) throw new Error('Can not add user to cloud storage!')
          }
        }
        toast.success('User registered success')
      }

      closeModal()
      refreshUsersList()
    } catch (error) {
      console.error('Failed when saving data:', error)
      toast.error(error.message || 'Failed when saving data')
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Do you confirm that you want to delete this user?')) {
      try {
        await makeDelete(`admin/deleteUser/${id}`)
        toast.success('User deleted')
        refreshUsersList()
      } catch (error) {
        console.error('Failed to delete user:', error)
        toast.error(error.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  // Tính toán số trang
  const totalPages = Math.ceil(users.length / usersPerPage)

  // Lấy users hiện tại
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser)

  // Thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className='mx-auto p-3 md:p-6 bg-gray-100 min-h-screen'>
      <ToastContainer position='top-right' />
      <header className='bg-purple-600 text-white shadow-md py-4'>
        <MegaMenuWithHover />
      </header>
      <div className='pt-16 md:pt-20'>
        <h1 className='text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-center text-black'>
          Admin Portal - {allUsers?.length > 0 && allUsers.length} Users
        </h1>

        <div className='flex flex-col md:flex-row justify-between mb-4 md:mb-6 space-y-3 md:space-y-0'>
          <div className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto'>
            <input
              type='text'
              value={searchTerm}
              onChange={handleInputChange}
              className='border border-gray-400 p-2 rounded-lg md:max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='Search by username'
            />
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className='border border-gray-400 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value='User'>User</option>
              <option value='Student'>Student</option>
              <option value='Tutor'>Tutor</option>
            </select>
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
                <th className='p-2 md:p-4 text-left'>ID</th>
                <th className='p-2 md:p-4 text-left'>UserName</th>
                <th className='p-2 md:p-4 text-left'>FullName</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Email</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>DateOfBirth</th>
                <th className='p-2 md:p-4 text-left'>Role</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Phone</th>
                <th className='p-2 md:p-4 text-left hidden md:table-cell'>Address</th>
                <th className='p-2 md:p-4 text-left'>Active</th>
                <th className='p-2 md:p-4 text-left'>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.userID} className='border-b hover:bg-purple-50'>
                  <td className='p-2 md:p-4'>{indexOfFirstUser + index + 1}</td>
                  <td className='p-2 md:p-4'>{user.userName}</td>
                  <td className='p-2 md:p-4'>{user.fullName}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{user.email}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{formatDate(user.dateOfBirth)}</td>
                  <td className='p-2 md:p-4'>{user.role}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{user.phone}</td>
                  <td className='p-2 md:p-4 hidden md:table-cell'>{user.address}</td>
                  <td className='p-2 md:p-4'>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs md:text-sm ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='p-2 md:p-4'>
                    {user.role !== 'Admin' && (
                      <div className='flex flex-col md:flex-row gap-1 md:gap-2'>
                        <button
                          onClick={() => toggleActiveStatus(user.userID, user.isActive)}
                          className={`text-xs md:text-sm p-1 md:p-2 rounded-lg transition-colors duration-300 ${
                            user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {user.isActive ? 'Ban' : 'Unban'}
                        </button>

                        <button
                          onClick={() => openEditModal(user)}
                          className='text-xs md:text-sm p-1 md:p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.userID)}
                          className='text-xs md:text-sm p-1 md:p-2 rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors duration-300'
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className='flex justify-center items-center mt-6 flex-wrap'>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            &laquo;
          </button>

          {[...Array(totalPages)].map((_, index) => {
            // Hiển thị giới hạn số nút phân trang
            const pageNum = index + 1

            // Chỉ hiển thị các nút gần trang hiện tại và nút đầu/cuối
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
            &raquo;
          </button>

          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value))
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

      {/* Modal thêm/sửa người dùng */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4'>
          <div className='bg-white rounded-lg p-4 md:p-8 w-full max-w-md md:max-w-xl mx-auto my-4 md:my-6 max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl md:text-2xl font-bold mb-4 text-center'>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='space-y-3'>
                {/* Thông tin cơ bản - luôn hiển thị */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Username</label>
                    <input
                      type='text'
                      name='userName'
                      value={formData.userName}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Full Name</label>
                    <input
                      type='text'
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>
                      {editingUser ? 'Password (leave empty to keep current)' : 'Password'}
                    </label>
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required={!editingUser}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Date of Birth</label>
                    <input
                      type='date'
                      name='dateOfBirth'
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Role</label>
                    <select
                      name='role'
                      value={formData.role}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
                      required
                      // Khóa trường Role khi đang edit
                    >
                      <option value='Student'>Student</option>
                      <option value='Tutor'>Tutor</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Phone</label>
                    <input
                      type='text'
                      name='phone'
                      value={formData.phone}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 text-sm font-semibold mb-1'>Status</label>
                    <select
                      name='active'
                      value={formData.active}
                      onChange={handleFormChange}
                      className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-1'>Address</label>
                  <input
                    type='text'
                    name='address'
                    value={formData.address}
                    onChange={handleFormChange}
                    className='w-full border border-gray-300 rounded-md p-2 text-sm'
                    required
                  />
                </div>

                {/* Upload Avatar cho tất cả người dùng */}
                <div>
                  <label className='block text-gray-700 text-sm font-semibold mb-1'>Avatar</label>
                  <input
                    type='file'
                    accept='image/*'
                    ref={avatarRef}
                    className='w-full border border-gray-300 rounded-md p-2 text-sm'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Or enter image URL:</p>
                  <input
                    type='text'
                    name='avatar'
                    value={formData.avatar}
                    onChange={handleFormChange}
                    placeholder='URL to avatar image'
                    className='w-full border border-gray-300 rounded-md p-2 text-sm mt-1'
                  />
                </div>

                {/* Các trường riêng cho Student */}
                {formData.role === 'Student' && !editingUser && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200'>
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-1'>Grade</label>
                      <input
                        type='text'
                        name='grade'
                        value={formData.grade}
                        onChange={handleFormChange}
                        className='w-full border border-gray-300 rounded-md p-2 text-sm'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-1'>School</label>
                      <input
                        type='text'
                        name='school'
                        value={formData.school}
                        onChange={handleFormChange}
                        className='w-full border border-gray-300 rounded-md p-2 text-sm'
                        required
                      />
                    </div>
                  </div>
                )}
                {/* Các trường riêng cho Tutor */}
                {formData.role === 'Tutor' && !editingUser && (
                  <div className='pt-2 border-t border-gray-200 space-y-3'>
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-1'>Workplace</label>
                      <input
                        type='text'
                        name='workplace'
                        value={formData.workplace}
                        onChange={handleFormChange}
                        className='w-full border border-gray-300 rounded-md p-2 text-sm'
                        required
                      />
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

                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-1'>Degrees</label>
                      <input
                        type='file'
                        accept='.pdf,.doc,.docx,image/*'
                        ref={degreesRef}
                        className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      />
                    </div>

                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-1'>Identity Card</label>
                      <input
                        type='file'
                        accept='.pdf,.doc,.docx,image/*'
                        ref={identityCardRef}
                        className='w-full border border-gray-300 rounded-md p-2 text-sm'
                      />
                    </div>
                  </div>
                )}
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
                  {editingUser ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Button - Hiển thị trong responsive view */}
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

      {/* Loading Indicator - Hiển thị khi đang tải dữ liệu */}
      {users.length === 0 && (
        <div className='flex justify-center items-center mt-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
          <p className='ml-3 text-purple-500'>Loading data...</p>
        </div>
      )}

      {/* Empty State - Hiển thị khi không có người dùng nào */}
      {allUsers.length > 0 && users.length === 0 && (
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
          <h3 className='text-xl font-medium text-gray-700 mb-2'>No users found</h3>
          <p className='text-gray-500 mb-4'>No users match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedRole('User')
              filterUsers('', 'User')
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

export default AdminPortal
