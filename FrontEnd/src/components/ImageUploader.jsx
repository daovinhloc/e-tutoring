import { useState, useRef } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ImageUploader = ({ type, onUpload, maxFiles, required }) => {
  const [filenames, setFilenames] = useState([])
  const [previews, setPreviews] = useState([])
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const files = event.target.files

    if (files.length + filenames.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`)
      return
    }

    const newFilenames = []
    const newPreviews = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newFilenames.push(file.name)

      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target.result)
        if (newPreviews.length === files.length) {
          setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
          onUpload([...fileInputRef.current.files])
        }
      }
      reader.readAsDataURL(file)
    }

    setFilenames((prevFilenames) => [...prevFilenames, ...newFilenames])
  }

  const handleDeletePicture = (index) => {
    setFilenames((prevFilenames) => {
      const newFilenames = prevFilenames.filter((_, i) => i !== index)
      return newFilenames
    })

    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index)
      return newPreviews
    })

    const newFiles = Array.from(fileInputRef.current.files).filter((_, i) => i !== index)
    fileInputRef.current.files = new DataTransfer().files
    newFiles.forEach((file) => fileInputRef.current.files.append(file))

    onUpload(newFiles)
  }

  return (
    <section className='container w-full mx-auto items-center'>
      <div>
        <input type='file' onChange={handleFileChange} multiple required={required} ref={fileInputRef} />
        <div className='px-4 py-6'>
          <div
            id='image-preview'
            className={`max-w-sm p-6 mb-4 relative ${
              previews.length ? '' : 'bg-gray-100 border-dashed border-2 border-gray-400'
            } rounded-lg items-center mx-auto text-center cursor-pointer`}
          >
            {previews.length ? (
              <>
                {previews.map((preview, index) => (
                  <div key={index} className='relative mb-4'>
                    <button
                      type='button'
                      onClick={() => handleDeletePicture(index)}
                      className='absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:bg-red-600 transition duration-150 ease-in-out'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        className='w-4 h-4'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M6 18L18 6M6 6l12 12'
                        ></path>
                      </svg>
                    </button>
                    <img src={preview} className='max-h-48 rounded-lg mx-auto' alt={`Image ${index + 1}`} />
                    <span className='block mt-2 text-gray-700 text-sm truncate max-w-xs'>{filenames[index]}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <label htmlFor='upload' className='cursor-pointer'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='w-8 h-8 text-gray-700 mx-auto mb-4'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                    />
                  </svg>
                  <h5 className='mb-2 text-xl font-bold tracking-tight text-gray-700'>Choose File</h5>
                </label>
              </>
            )}
            <p className='font-normal text-sm text-gray-400 md:px-6'>
              Choose photo size should be less than <b className='text-gray-600'>2mb</b>
            </p>
            <p className='font-normal text-sm text-gray-400 md:px-6'>
              and should be in <b className='text-gray-600'>JPG, PNG, or GIF</b> format.
            </p>
            <span id='filename' className='text-gray-500 bg-gray-200 z-50 block max-w-xs overflow-hidden'>
              {filenames.join(', ')}
            </span>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  )
}

export default ImageUploader
