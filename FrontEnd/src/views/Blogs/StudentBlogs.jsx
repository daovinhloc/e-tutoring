import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { makeGet, makePost } from '../../apiService/httpService.js'
import MegaMenuWithHover from '../../components/MegaMenuWithHover.jsx'
import BreadcrumbsWithIcon from '../../components/BreadCrumb.jsx'

const StudentBlogs = () => {
  const { classID } = useParams()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const role = localStorage.getItem('role') // Lấy role từ localStorage

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('1')

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await makeGet('blogs', { class_id: classID })
      setBlogs(response.data)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [classID])

  const handleCreateBlog = async () => {
    try {
      await makePost('blogs', {
        class_id: classID,
        title,
        description,
        content,
        status
      })
      setShowModal(false)
      setTitle('')
      setDescription('')
      setContent('')
      setStatus(1)
      fetchBlogs()
    } catch (error) {
      console.error('Error creating blog:', error)
    }
  }

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(new Date(dateStr))
  }

  // Tạo mảng breadcrumbs có URL đúng
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'My Classes', path: '/my-classes' },
    { name: 'Blogs', path: '#' } // Trang hiện tại
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-orange-400 text-white shadow-md fixed top-0 w-full z-20'>
        <MegaMenuWithHover />
      </header>

      <div className='container mx-auto px-3 sm:px-4 md:px-6 pt-20'>
        {/* Breadcrumb section - Responsive */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200 mb-4 sm:mb-6 gap-2'>
          <BreadcrumbsWithIcon pathnames={breadcrumbs} />

          {role == 'Student' && (
            <button
              onClick={() => setShowModal(true)}
              className='px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-orange-600 transition duration-300 flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                  clipRule='evenodd'
                />
              </svg>
              New Blog
            </button>
          )}
        </div>

        {/* <div className='w-full flex justify-between mt-4 items-end mb-4'>
        <BreadcrumbsWithIcon pathnames={['Home', 'Blog']} />
        <button
          onClick={() => setShowModal(true)}
          className='px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-300 py-2'
        >
          New Blog
        </button>
      </div> */}

        <h1 className='text-2xl sm:text-3xl font-bold text-orange-800 mb-4 sm:mb-6'>Class Blog</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 pb-8 sm:pb-10'>
          {loading && (
            <div className='col-span-full flex justify-center items-center py-12 sm:py-20'>
              <div className='animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500'></div>
              <p className='ml-3 text-orange-500 text-sm sm:text-base'>Loading blogs...</p>
            </div>
          )}

          {!loading && blogs.length === 0 && (
            <div className='col-span-full bg-white rounded-xl shadow-md p-6 sm:p-12 text-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2h8z'
                />
              </svg>
              <h3 className='text-lg sm:text-xl font-medium text-gray-700 mb-2'>No blogs available</h3>
              <p className='text-gray-500 text-sm sm:text-base'>Be the first to create a blog for this class!</p>
            </div>
          )}

          {blogs.map((blog) => (
            <Link to={`/my-classes/${classID}/blogs/blogDetail/${blog.blog_id}`} key={blog.blog_id} state={blog}>
              <div className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col h-full transform hover:-translate-y-1'>
                <div className='h-36 sm:h-48 overflow-hidden'>
                  <img
                    src='https://t.ex-cdn.com/danviet.vn/768w/files/news/2025/04/18/fb_img_1744977210928-1901.jpg'
                    alt={blog.title}
                    className='w-full h-full object-cover transition duration-300 hover:scale-105'
                  />
                </div>
                <div className='p-4 sm:p-6 flex-grow'>
                  <div className='flex items-center text-xs text-gray-500 mb-2'>
                    <span
                      className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs ${
                        blog.status == '1' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {blog.status == '1' ? 'Published' : 'Draft'}
                    </span>
                    <span className='mx-2'>•</span>
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                  <h2 className='text-base sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2'>{blog.title}</h2>
                  <p className='text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3'>
                    {blog.description || 'No description provided'}
                  </p>
                  <div className='flex items-center mt-auto'>
                    <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xs sm:text-sm'>
                      {blog.author ? blog.author.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <span className='ml-2 text-gray-700 text-sm sm:text-base'>{blog.author ?? 'Me'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modal - Responsive */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4'>
          <div className='bg-white rounded-lg w-full max-w-md sm:max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto'>
            <div className='bg-orange-500 py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-10'>
              <h2 className='text-lg sm:text-xl font-bold text-white'>Create New Blog</h2>
            </div>
            <div className='p-4 sm:p-6 space-y-3 sm:space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
                <input
                  type='text'
                  placeholder='Enter blog title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                <textarea
                  placeholder='Brief description of your blog'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  rows={3}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Content</label>
                <textarea
                  placeholder='Write your blog content here...'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  rows={6}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                >
                  <option value='1'>Published</option>
                  <option value='0'>Draft</option>
                </select>
              </div>
              <div className='flex justify-end space-x-3 pt-3 sm:pt-4 border-t mt-3 sm:mt-4'>
                <button
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 text-sm sm:text-base'
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBlog}
                  className='px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transition duration-200 text-sm sm:text-base'
                >
                  Create Blog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentBlogs
