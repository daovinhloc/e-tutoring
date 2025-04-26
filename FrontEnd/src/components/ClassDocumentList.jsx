import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { makeGet } from '../apiService/httpService'

export default function ClassDocumentList({ role, classId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDocumentByClassId = async () => {
    setLoading(true)
    try {
      const response =
        role === 'Student'
          ? await makeGet(`students/getDocuments/${classId}`)
          : await makeGet(`tutors/getDocuments/${classId}`)
      setDocuments(response.data)
    } catch (error) {
      toast.error('Failed to fetch class documents data')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchDocumentByClassId()
  }, [classId])

  return (
    <>
      {loading ? (
        <p className='text-center text-gray-600'>Loading...</p>
      ) : documents.length === 0 ? (
        <p className='text-center text-gray-600'>No documents available.</p>
      ) : (
        <div className='grid grid-cols-1 gap-4'>
          {documents.map((doc) => (
            <div key={doc.documentID} className='bg-gray-100 p-4 rounded shadow-lg'>
              <div className='text-md mb-2 flex justify-between'>
                <h5>{doc.documentTitle}</h5>
                <a
                  href={doc.documentLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mx-2 text-orange-700 hover:text-blue-700'
                >
                  <span>
                    <i className='fa-solid fa-download'></i>
                  </span>
                </a>
              </div>
              <p className='text-sm text-gray-800 mb-2'>{doc.description}</p>
              <p className='text-xs text-gray-600'>
                <i className='fa-solid fa-clock mr-2'></i>
                {new Date(doc.uploadedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </>
  )
}
