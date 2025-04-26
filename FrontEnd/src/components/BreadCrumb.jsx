import React from 'react'
import { Link } from 'react-router-dom'

const BreadcrumbsWithIcon = ({ pathnames }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {pathnames.map((item, index) => {
          // Xác định xem đây là object hay string
          const isObject = typeof item === 'object';
          const name = isObject ? item.name : item;
          const path = isObject ? item.path : '#'; // Nếu là string, mặc định là #
          
          // Nếu là mục cuối cùng, không cho phép click
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
              )}
              
              {isLast ? (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  {name}
                </span>
              ) : (
                <Link
                  to={path}
                  className="ml-1 text-sm font-medium text-blue-500 hover:text-blue-600 md:ml-2 dark:text-blue-400 dark:hover:text-white"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  )
}

export default BreadcrumbsWithIcon