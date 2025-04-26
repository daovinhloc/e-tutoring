import React, { useState, useEffect } from 'react'
import { Input, Button } from '@material-tailwind/react'
import { makeGet } from '../../apiService/httpService'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (query.length > 0) {
      fetchSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query])

  const fetchSuggestions = async (searchQuery) => {
    try {
      const tutorResponse = await makeGet(`public/students/searchTutorByTutorName/${searchQuery}`)
      // const classResponse = await axios.get(`http://localhost:5000/api/students/searchClassByTutorName/${searchQuery}`)
      const classByName = await makeGet(`public/students/searchClassByClassName/${searchQuery}`)
      const classBySubject = await makeGet(`public/students/searchClassBySubject/${searchQuery}`)

      const tutorSuggestions = tutorResponse.data
      const classSuggestions = [...classByName.data, ...(classBySubject?.data?.classroom || [])].filter(
        (classItem) => classItem.isActive === 1
      ) //...classResponse.data.data

      setSuggestions([...classSuggestions, ...tutorSuggestions])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <div className='relative flex flex-col w-full gap-2 md:w-auto sm:w-auto mx-auto overflow-visible'>
      <div className='relative flex w-full gap-2'>
        <Input
          type='search'
          color='blue-gray'
          labelProps={{
            className: 'before:content-none after:content-none'
          }}
          className='pr-12 border-white blue-gray bg-white focus:!border-transparent'
          containerProps={{
            className: 'sm:min-w-[100px] lg:min-w-[350px] md:min-w-[150px] border-white'
          }}
          value={query}
          onChange={handleInputChange}
          placeholder='Search for tutors or classes...'
        />
        <Button
          size='sm'
          color='blue'
          className='align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-2 px-3 bg-gradient-to-r from-orange-500 to-orange-800 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none !absolute right-1 top-1 rounded '
        >
          <i className='fa-solid fa-magnifying-glass'></i>
        </Button>
      </div>
      {suggestions.length > 0 && (
        <ul className='absolute z-100 w-full mt-12 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <li key={index} className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-black'>
              {suggestion.className ? (
                <a href={`/classDetail/${suggestion.classID}`} className='block'>
                  <div className='flex justify-between'>
                    <span>{suggestion.className}</span>
                    <span className='text-gray-500'>{suggestion.subject}</span>
                  </div>
                </a>
              ) : (
                <a href={`/tutor-profile/${suggestion.userID}`} className='block'>
                  <div className='flex justify-between'>
                    <span>{suggestion.fullName}</span>
                    <span className='text-gray-500'>{suggestion.rating ? suggestion.rating + '/5' : 'No Rating'}</span>
                  </div>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
