import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { makeGet, makePost } from '../../apiService/httpService.js'
import MegaMenuWithHover from '../../components/MegaMenuWithHover.jsx'
import BreadcrumbsWithIcon from '../../components/BreadCrumb.jsx'
import ClassDocument from '../../components/ClassDocument.jsx'
const ClassroomStream = () => {
  const { classID } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [classDetails, setClassDetails] = useState(null)
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'Student')
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [commentingOnPost, setCommentingOnPost] = useState(null)
  const fileInputRef = useRef(null)
  const announcementFileRef = useRef(null)

  // Form state
  const [postType, setPostType] = useState('announcement')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignmentFile, setAssignmentFile] = useState(null)
  const [announcementFiles, setAnnouncementFiles] = useState([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')

  // Thay đổi fetchPosts để sử dụng endpoint đúng
  const fetchPosts = async () => {
    try {
      setLoading(true)
      console.log('Fetching posts for classID:', classID)

      // Endpoint đúng: assignment/getAll
      const response = await makeGet('assignment/getAll', { class_id: classID })
      console.log('Posts received:', response.data)
      setPosts(response.data)

      // Initialize comments for each post
      const commentState = {}

      // Lấy comments cho mỗi bài đăng (nếu có)
      await Promise.all(
        response.data.map(async (post) => {
          try {
            // Endpoint đúng cho comments
            const commentResponse = await makeGet(`assignment/${post.post_id}/comments`)
            commentState[post.post_id] = commentResponse.data || []
            console.log(`Comments for post ${post.post_id}:`, commentResponse.data)
          } catch (error) {
            console.error(`Error fetching comments for post ${post.post_id}:`, error)
            commentState[post.post_id] = []
          }
        })
      )

      setComments(commentState)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Thêm hàm fetchClassDetails để lấy thông tin lớp học
  const fetchClassDetails = async () => {
    try {
      const response = await makeGet(`public/tutors/class/${classID}`)
      setClassDetails(response.data)
    } catch (error) {
      console.error('Error fetching class details:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchClassDetails()
      await fetchPosts()
    }

    loadData()
  }, [classID]) // Thêm classID vào dependency array để load lại khi ID thay đổi

  // Thay đổi trong hàm handleCreatePost
  const handleCreatePost = async () => {
    try {
      const formData = new FormData()
      formData.append('class_id', classID)
      formData.append('title', title)
      formData.append('description', content) // Sửa từ 'content' thành 'description'

      // Thêm files nếu có
      if (postType === 'assignment') {
        if (assignmentFile) {
          formData.append('files', assignmentFile)
        }
      } else {
        // Thêm nhiều file cho announcements
        announcementFiles.forEach((file) => {
          formData.append('files', file)
        })
      }

      // Sử dụng endpoint đúng
      await makePost('assignment/create', formData)

      // Reset form
      setShowModal(false)
      setTitle('')
      setContent('')
      setDueDate('')
      setAssignmentFile(null)
      setAnnouncementFiles([])

      // Refresh post list
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  // Thay đổi trong hàm handleCreateAnnouncement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()

    if (!announcementText.trim()) return

    try {
      const formData = new FormData()
      formData.append('class_id', classID)
      formData.append('title', 'Announcement') // Thêm title
      formData.append('description', announcementText) // Sửa từ 'content' thành 'description'

      // Thêm files nếu có
      if (announcementFileRef.current && announcementFileRef.current.files.length > 0) {
        for (let i = 0; i < announcementFileRef.current.files.length; i++) {
          formData.append('files', announcementFileRef.current.files[i])
        }
      }

      // Sử dụng endpoint đúng
      await makePost('assignment/create', formData)

      // Reset form
      setAnnouncementText('')
      setShowAnnouncementForm(false)
      if (announcementFileRef.current) announcementFileRef.current.value = ''

      // Refresh post list
      fetchPosts()
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  // Sửa hàm handleAddComment
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return

    try {
      console.log(`Adding comment to post ${postId}: ${newComment}`)

      // Sử dụng endpoint đúng cho comments
      const response = await makePost(`assignment/${postId}/comments`, {
        content: newComment
        // Không cần gửi user_role nữa vì backend sẽ lấy từ token JWT
      })

      console.log(`Comment added to post ${postId}:`, response.data)

      // Update comments state với dữ liệu từ server
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data]
      }))

      // Reset form
      setNewComment('')
      setCommentingOnPost(null)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  }

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'My Classes', path: '/my-classes' },
    { name: classDetails?.className || 'Class', path: '#' }
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-orange-400 text-white shadow-md fixed top-0 w-full z-20'>
        <MegaMenuWithHover />
      </header>

      <div className='container mx-auto px-3 sm:px-4 md:px-6 pt-20'>
        {/* Breadcrumb section */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200 mb-4 gap-2'>
          <BreadcrumbsWithIcon pathnames={breadcrumbs} />

          {/* Show add post button only when user is Tutor */}
          {userRole === 'Tutor' && (
            <button
              onClick={() => setShowModal(true)}
              className='px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-blue-600 transition duration-300 flex items-center'
            >
              <i className='mr-2 fa-solid fa-plus'></i> Post
            </button>
          )}
        </div>

        {/* Class stream */}
        <div className='flex gap-4 mb-6 flex-col md:flex-row'>
          <div className='w-full md:w-3/4'>
            {/* Class information */}
            <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800'>{classDetails?.className}</h1>
                  <p className='text-gray-600'>{classDetails?.subject}</p>
                </div>
                <div className='mt-2 md:mt-0'>
                  <p className='text-gray-600'>Tutor: {classDetails?.tutorFullName}</p>
                </div>
              </div>
            </div>

            {/* Announcement form - similar to Google Classroom */}
            <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
              {!showAnnouncementForm ? (
                <div
                  className='flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50'
                  onClick={() => setShowAnnouncementForm(true)}
                >
                  <div className='w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
                      />
                    </svg>
                  </div>
                  <p className='text-gray-500'>Announce something to your class</p>
                </div>
              ) : (
                <form onSubmit={handleCreateAnnouncement}>
                  <div className='mb-4'>
                    <textarea
                      placeholder='Announce something to your class'
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      rows={3}
                    ></textarea>
                  </div>

                  <div className='flex justify-between items-center'>
                    <div className='flex gap-2'>
                      <input
                        type='file'
                        ref={announcementFileRef}
                        className='hidden'
                        multiple
                        onChange={(e) => console.log(e.target.files)}
                      />
                      <button
                        type='button'
                        onClick={() => announcementFileRef.current.click()}
                        className='p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                          />
                        </svg>
                      </button>
                      <button type='button' className='p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </svg>
                      </button>
                      <button type='button' className='p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                          />
                        </svg>
                      </button>
                    </div>

                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setShowAnnouncementForm(false)
                          setAnnouncementText('')
                        }}
                        className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm'
                      >
                        Cancel
                      </button>
                      <button
                        type='submit'
                        disabled={!announcementText.trim()}
                        className={`px-4 py-2 rounded-lg text-white text-sm ${
                          announcementText.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'
                        }`}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Post list */}
            {loading ? (
              <div className='flex justify-center items-center py-10'>
                <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500'></div>
                <p className='ml-3 text-blue-500'>Loading data...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 mx-auto text-gray-400 mb-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <h3 className='text-lg font-medium text-gray-700 mb-2'>No posts yet</h3>
                <p className='text-gray-500'>Announcements and assignments will be shown here</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {posts.map((post) => (
                  <div key={post.id} className='bg-white rounded-lg shadow-md overflow-hidden'>
                    <div
                      className={`px-4 py-3 ${
                        post.type === 'assignment' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'
                      }`}
                    >
                      <div className='flex items-start'>
                        {/* Icon for post type */}
                        <div
                          className={`rounded-full p-2 mr-3 ${
                            post.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {post.type === 'assignment' ? (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
                              />
                            </svg>
                          )}
                        </div>

                        <div className='flex-1'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <p className='font-medium'>
                                {post.tutorName || 'Tutor'}
                                {post.type === 'assignment' && (
                                  <span className='ml-2 text-sm text-blue-600 font-bold'>• Assignment</span>
                                )}
                              </p>
                              <p className='text-xs text-gray-500'>{formatDate(post.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='p-4'>
                      {post.title && <h3 className='text-lg font-semibold mb-2'>{post.title}</h3>}
                      <div className='prose max-w-none text-gray-700'>
                        <p>{post.description}</p>
                      </div>

                      {/* Files attached to the post */}
                      {post.files && post.files.length > 0 && (
                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                          <h4 className='text-sm font-medium text-gray-700 mb-2'>Attachments</h4>
                          <div className='space-y-2'>
                            {post.files.map((file, index) => (
                              <div key={index} className='p-2 border border-gray-200 rounded flex items-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-5 w-5 text-gray-500 mr-2'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                  />
                                </svg>
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className='text-blue-500 hover:underline text-sm flex-1'
                                  target='_blank'
                                  rel='noopener noreferrer'
                                >
                                  {file.name || 'Attachment'}
                                </a>
                                <button className='ml-2 text-gray-500 hover:text-blue-500'>
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {post.type === 'assignment' && (
                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <p className='text-sm text-gray-600'>
                                Due date: <span className='font-medium'>{formatDate(post.dueDate)}</span>
                              </p>
                            </div>
                            <div>
                              <Link
                                to={`/classes/${classID}/assignment/${post.id}`}
                                className='px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600'
                              >
                                View details
                              </Link>
                            </div>
                          </div>

                          {post.fileUrl && (
                            <div className='mt-2 p-2 border border-gray-200 rounded flex items-center'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-5 w-5 text-gray-500 mr-2'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                />
                              </svg>
                              <a
                                href={post.fileUrl}
                                className='text-blue-500 hover:underline text-sm'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {post.fileName || 'Attached document'}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Comments section */}
                    <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>
                      {comments[post.post_id] && comments[post.post_id].length > 0 && (
                        <div className='mb-4 space-y-3'>
                          <h4 className='text-sm font-medium text-gray-700'>Class comments</h4>
                          {comments[post.post_id].map((comment, index) => (
                            <div key={index} className='flex items-start'>
                              <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3'>
                                {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className='flex-1'>
                                <div className='flex items-center'>
                                  <p className='font-medium text-sm'>{comment.authorName || 'User'}</p>
                                  <p className='ml-2 text-xs text-gray-500'>{formatDate(comment.created_at)}</p>
                                </div>
                                <p className='text-gray-700 text-sm'>{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment form */}
                      {commentingOnPost === post.post_id ? (
                        <div className='flex items-start'>
                          <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3'>
                            U
                          </div>
                          <div className='flex-1'>
                            <input
                              type='text'
                              placeholder='Add class comment...'
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.post_id)}
                            />
                            <div className='flex justify-end mt-2 space-x-2'>
                              <button
                                className='px-3 py-1 text-gray-500 hover:bg-gray-100 rounded text-sm'
                                onClick={() => {
                                  setCommentingOnPost(null)
                                  setNewComment('')
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
                                onClick={() => handleAddComment(post.post_id)}
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          className='flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm'
                          onClick={() => setCommentingOnPost(post.post_id)}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 mr-1'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                            />
                          </svg>
                          Add class comment
                        </button>
                      )}

                      {post.type === 'assignment' && userRole === 'Student' && (
                        <div className='mt-3 border-t pt-3 border-gray-200'>
                          <Link
                            to={`/classes/${classID}/assignment/${post.id}/submit`}
                            className='flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm'
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-4 w-4 mr-1'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                              />
                            </svg>
                            Submit work
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Class info sidebar */}
          <div className='md:w-1/4 w-full'>
            <div className='bg-white rounded-lg shadow-md p-4 mb-6 max-h-42 overflow-auto'>
              <ClassDocument classId={classID} />
            </div>
            <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
              <h3 className='text-lg font-medium mb-3'>Class Details</h3>
              <p className='mb-2'>
                <span className='font-medium'>Duration:</span> {classDetails?.length} minutes
              </p>
              <p className='mb-2'>
                <span className='font-medium'>Mode:</span> {classDetails?.type}
              </p>
              <p className='mb-2'>
                <span className='font-medium'>Status:</span> {classDetails?.isActive == 1 ? 'Active' : 'Inactive'}
              </p>
            </div>

            <div className='bg-white rounded-lg shadow-md p-4'>
              <h3 className='text-lg font-medium mb-3'>Quick Links</h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    to={`/my-classes/${classID}/blogs`}
                    className='flex items-center text-blue-600 hover:text-blue-800'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-2'
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
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link to={`/class/${classID}/chat`} className='flex items-center text-blue-600 hover:text-blue-800'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                      />
                    </svg>
                    Chat
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create new post modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-md md:max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto'>
            <div className='bg-blue-500 py-3 px-4 sticky top-0 z-10'>
              <h2 className='text-lg font-bold text-white'>Create New Post</h2>
            </div>
            <div className='p-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='announcement'>Announcement</option>
                  <option value='assignment'>Assignment</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
                <input
                  type='text'
                  placeholder='Enter title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Content</label>
                <textarea
                  placeholder='Enter detailed content'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={5}
                />
              </div>

              {postType === 'assignment' ? (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Due Date</label>
                    <input
                      type='datetime-local'
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Attachment (optional)</label>
                    <input
                      type='file'
                      onChange={(e) => setAssignmentFile(e.target.files[0])}
                      className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Attachments (optional)</label>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      setAnnouncementFiles(files)
                    }}
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  {announcementFiles.length > 0 && (
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>{announcementFiles.length} file(s) selected</p>
                      <ul className='mt-1 text-xs text-gray-500'>
                        {announcementFiles.map((file, index) => (
                          <li key={index} className='truncate'>
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className='flex justify-end space-x-3 pt-4 border-t mt-4'>
                <button
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 text-sm'
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className='px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transition duration-200 text-sm'
                  disabled={!title.trim() || !content.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment submission modal */}
      {userRole === 'Student' && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 ${
            false ? 'block' : 'hidden'
          }`}
        >
          <div className='bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto'>
            <div className='bg-blue-500 py-3 px-4 sticky top-0 z-10'>
              <h2 className='text-lg font-bold text-white'>Submit Assignment</h2>
            </div>
            <div className='p-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Your work</label>
                <textarea
                  placeholder='Add private comment to teacher (optional)'
                  className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Add attachment</label>
                <input
                  type='file'
                  ref={fileInputRef}
                  className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div className='flex justify-end space-x-3 pt-4 border-t mt-4'>
                <button className='px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 text-sm'>
                  Cancel
                </button>
                <button className='px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transition duration-200 text-sm'>
                  Turn in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassroomStream
