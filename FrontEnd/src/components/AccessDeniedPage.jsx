import React from 'react'
import MegaMenuWithHover from './MegaMenuWithHover' // Import your MegaMenu component
import { LockClosedIcon } from '@heroicons/react/24/outline'

function AccessDeniedPage() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <MegaMenuWithHover />
      <div className='max-w-md px-6 py-12 bg-white shadow-lg rounded-lg text-center'>
        <LockClosedIcon className='mx-auto h-12 w-12 text-gray-800' />
        <h1 className='text-3xl font-bold text-gray-800 mb-4'>Access Denied</h1>
        <p className='text-gray-600 mb-8'>You do not have permission to view this page.</p>
        <a className='text-gray-500 mt-4' href='/'>
          Maybe try returning to the <a className='text-orange-400 font-bold'>home page</a>.
        </a>
      </div>
    </div>
  )
}

export default AccessDeniedPage
