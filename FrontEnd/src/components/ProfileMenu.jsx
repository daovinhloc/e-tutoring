import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Menu, MenuHandler, MenuList, MenuItem, Typography } from '@material-tailwind/react'
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import AuthContext from '../contexts/JWTAuthContext'

const profileMenuItems = [
  {
    label: 'My Profile',
    icon: UserCircleIcon,
    action: 'profile' // Add action type for profile
  },
  {
    label: 'Request',
    icon: BellIcon,
    action: 'request'
  },
  {
    label: 'Complaint',
    icon: InboxArrowDownIcon,
    action: 'complaint'
  },
  {
    label: 'Help',
    icon: LifebuoyIcon
  },
  {
    label: 'Sign Out',
    icon: PowerIcon,
    action: 'logout'
  }
]

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate() // Use useNavigate for navigation

  const closeMenu = () => setIsMenuOpen(false)

  const handleMenuItemClick = (action) => {
    if (action === 'logout') {
      logout()
      
      navigate('/')
    } else if (action === 'profile') {
      navigate('/profile') 
    } else if (action === 'complaint') {
      navigate('/complaint')  
    } else if (action === 'request') {
      navigate('/view-tutor-request') // Navigate to the profile page
    } else if (action === 'logout') {
      navigate('/login')
    }
    closeMenu()
  }

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement='bottom-end'>
      <MenuHandler>
        <Button
          variant='text'
          color='blue-gray'
          className='flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto'
        >
          <Typography variant='small' color='gray' className='font-normal'>
            Hi, {user ? user.userName : 'Guest'}
          </Typography>
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          />
          {user && user.avatar ? (
            <img
              src={user.avatar}
              alt='Profile'
              className='border border-gray-900 p-0.5 h-8 w-8 rounded-full object-cover object-center'
            />
          ) : (
            <UserCircleIcon className='h-8 w-8 rounded-full border border-gray-900 p-0.5' />
          )}
        </Button>
      </MenuHandler>
      <MenuList className='p-1'>
        {profileMenuItems.map(({ label, icon, action }, key) => (
          <MenuItem
            key={label}
            onClick={() => handleMenuItemClick(action)}
            className='flex items-center gap-2 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10'
          >
            {React.createElement(icon, {
              className: 'h-4 w-4',
              strokeWidth: 2
            })}
            <Typography as='span' variant='small' className='font-normal' color='inherit'>
              {label}
            </Typography>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default ProfileMenu
