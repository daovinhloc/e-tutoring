import { useEffect, useState, useContext, useRef } from 'react'
import { makeGet, makePost } from '../apiService/httpService'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../contexts/JWTAuthContext'
import supabase from '../apiService/supabase'
import ClassDocumentList from './ClassDocumentList'

const ClassDocument = ({ classId }) => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentDescription, setDocumentDescription] = useState('')
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    if (!user || !user.role) {
      navigate('/unauthorized')
    }
  }, [classId, user])

  const handleUploadDocument = async () => {
    if (!selectedFile || !documentTitle || !documentDescription) {
      toast.warning('Please choose a file and enter to all fields')
      return
    }

    setUploading(true)

    const fileExt = selectedFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, selectedFile)

    if (uploadError) {
      toast.error('File upload failed')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
    const publicUrl = data.publicUrl

    const newDoc = {
      documentTitle,
      documentLink: publicUrl,
      classID: classId,
      description: documentDescription,
      uploadAt: new Date().toISOString()
    }

    try {
      await makePost(`tutors/insertDocument/${classId}`, newDoc)
      toast.success('Document uploaded successfully!')
      // reset form
      setDocumentTitle('')
      setDocumentDescription('')
      setSelectedFile(null)
      fileInputRef.current.value = ''
      setShowModal(false)
    } catch (err) {
      toast.error('Failed to save document')
    } finally {
      setUploading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setDocumentTitle('')
    setDocumentDescription('')
    setSelectedFile(null)
    fileInputRef.current.value = ''
  }

  return (
    <div>
      <div>
        <h2 className='text-lg font-medium mb-2 text-left'>Documents</h2>
        {user && user.role === 'Tutor' && (
          <div className='mb-2'>
            <button
              onClick={() => setShowModal(true)}
              className='text-blue-500 px-2 py-1 rounded hover:text-blue-600 hover:bg-gray-200'
            >
              <i className='mr-2 fa-solid fa-plus'></i>Document
            </button>
          </div>
        )}
        {user && user.role && classId && <ClassDocumentList role={user.role} classId={classId} />}
      </div>
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md pb-2'>
            <h3 className='text-lg font-bold mb-3 text-white bg-blue-600 p-4 rounded-t-lg'>Upload New Document</h3>
            <div className='p-3'>
              <input
                type='text'
                placeholder='Document Title'
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className='w-full p-2 border mb-2 rounded'
                required
              />
              <textarea
                placeholder='Description'
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                className='w-full p-2 border mb-2 rounded'
              />
              <input
                type='file'
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className='w-full p-2 border mb-4 rounded'
              />
              <div className='flex gap-2 justify-end'>
                <button
                  onClick={handleUploadDocument}
                  disabled={uploading}
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default ClassDocument
