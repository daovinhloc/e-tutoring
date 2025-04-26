import React, { useState, useEffect, useContext, useRef } from 'react'
import Logo from '../assets/logoNav.png'
import NavList from './NavList'
import { Link } from 'react-router-dom'
import { Button, Input, Collapse, IconButton } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import AuthContext from '../contexts/JWTAuthContext'
import SearchBar from './Navigation/SearchBar'
import ChatRoomList from './ChatRoomList'

export function MegaMenuWithHover() {
  const [openSearch, setOpenSearch] = useState(false)
  const [openNav, setOpenNav] = useState(false)
  const { user, isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    window.addEventListener('resize', () => window.innerWidth >= 960 && setOpenNav(false))
    window.addEventListener('resize', () => window.innerWidth >= 960 && setOpenSearch(false))
  }, [])
  return (
    <>
      <div className='block shadow-md backdrop-saturate-200 backdrop-blur-2xl text-white w-full fixed top-0 left-0 right-0 px-0 py-0 bg-orange-300 z-50'>
        <div className='w-full flex items-center justify-between text-white py-2 px-4'>
          <Link to='/' className='inline-block'>
            <img className='h-16 min-w-11 ml-6' src={Logo} alt='Logo' />
          </Link>
          <div className='mobile-hidden ml-auto mr-12 md:hidden lg:block'>
            <SearchBar />
          </div>

          <div className='mobile-hidden md:hidden lg:block'>
            {/* Pass isAuthenticated state to NavList */}
            <NavList isAuthenticated={isAuthenticated} />
          </div>
          <div>
            <IconButton
              variant='text'
              color='blue-gray'
              className='lg:hidden'
              onClick={() => setOpenSearch(!openSearch)}
            >
              {openSearch ? (
                <XMarkIcon className='h-6 w-6' strokeWidth={2} />
              ) : (
                <MagnifyingGlassIcon className='h-6 w-6' strokeWidth={2} />
              )}
            </IconButton>
            <IconButton variant='text' color='blue-gray' className='lg:hidden' onClick={() => setOpenNav(!openNav)}>
              {openNav ? (
                <XMarkIcon className='h-6 w-6' strokeWidth={2} />
              ) : (
                <Bars3Icon className='h-6 w-6' strokeWidth={2} />
              )}
            </IconButton>
          </div>
        </div>
        <Collapse open={openSearch} className={openSearch ? 'overflow-visible' : ''}>
          <div className='text-center px-2 py-3'>
            <SearchBar />
          </div>
        </Collapse>
        <Collapse open={openNav}>
          {/* Pass isAuthenticated state to NavList */}
          <NavList isAuthenticated={isAuthenticated} />
        </Collapse>
      </div>
      {user && (user.role === 'Student' || user.role === 'Tutor') && <ChatRoomList user={user} />}
    </>
  )
}

export default MegaMenuWithHover
