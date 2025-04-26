import React, { useState, useEffect } from 'react'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import AccessDeniedPage from '../components/AccessDeniedPage.jsx'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeDelete, makeGet } from '../apiService/httpService.js'
const AdminPortalComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token || role !== 'Admin') {
    return <AccessDeniedPage />
  }

  useEffect(() => {
    // Fetch complaints from the API
    makeGet('admin/complainList')
      .then((response) => {
        setComplaints(response.data)
      })
      .catch((error) => {
        console.error('Error fetching complaints:', error)
      })
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    filterComplaints(value)
  }

  const filterComplaints = (searchTerm) => {
    let filteredComplaints = complaints

    if (searchTerm.trim() !== '') {
      filteredComplaints = filteredComplaints.filter(
        (complaint) => complaint.message && complaint.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setComplaints(filteredComplaints)
  }

  const handleDeleteComplaint = (id) => {
    makeDelete(`admin/deleteComplains/${id}`)
      .then((response) => {
        setComplaints(complaints.filter((complaint) => complaint.complainID !== id))
        toast.success('Complaint deleted successfully!')
      })
      .catch((error) => {
        console.error('Error deleting complaint:', error)
        toast.error('Failed to delete complaint.')
      })
  }

  return (
    <div className='mx-auto p-6 bg-gray-100 min-h-screen'>
      <header className='bg-purple-600 text-white shadow-md py-4'>
        <MegaMenuWithHover />
      </header>
      <div className='pt-20'>
        <h1 className='text-4xl font-bold mb-6 text-center text-black'>Admin Portal - Complaints</h1>
        <div className='flex justify-center mb-6'>
          <input
            type='text'
            value={searchTerm}
            onChange={handleInputChange}
            className='border border-gray-400 p-2 rounded-lg flex-grow max-w-xl focus:outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='Search by message'
          />
        </div>
        <table className='mx-auto min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead className='bg-gradient-to-t from-yellow-700 to-yellow-300 text-black'>
            <tr>
              <th className='p-4 text-left'>ID</th>
              <th className='p-4 text-left'>User ID</th>
              <th className='p-4 text-left'>Message</th>
              <th className='p-4 text-left'>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint, index) => (
              <tr key={complaint.complainID} className='border-b hover:bg-purple-50'>
                <td className='p-4'>{index + 1}</td>
                <td className='p-4'>{complaint.uID}</td>
                <td className='p-4'>{complaint.message}</td>
                <td className='p-4'>
                  <button
                    onClick={() => handleDeleteComplaint(complaint.complainID)}
                    className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  )
}

export default AdminPortalComplaints
