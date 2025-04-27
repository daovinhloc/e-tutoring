import { useEffect, useRef, useState } from 'react'
import ChatBox from './ChatBox'
import { makePost } from '../apiService/httpService'
import supabase from '../apiService/supabase'
import { makeGet } from '../apiService/httpService'
const ChatRoomList = ({ user }) => {
  const [classes, setClasses] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const chatBoxRef = useRef()
  const fetchRooms = async () => {
    if (user.role === 'Tutor') {
      const response = await makePost(`tutors/findClasses/${user.tutorID}`)
      if (response) {
        const activeClasses = response.classroom.filter((c) => c.isActive)
        setClasses(activeClasses)
      }
    }

    if (user.role === 'Student') {
      const response = await makeGet(`students/classes`)
      if (response) {
        const activeClasses = response.data.filter((c) => c.isActive)
        setClasses(activeClasses)
      }
    }
  }
  const handleSelectRoom = async (classID) => {
    const { data, error } = await supabase.from('chat_rooms').select('*').eq('class_id', classID)

    if (error) {
      console.error('Error fetching chat room:', error)
    }

    if (data && data.length) {
      setSelectedRoom(data[0].class_id)
    } else {
      if (user.role === 'Tutor') {
        await createChatRoom(classID)
      } else {
        console.log('This chat room is not available now')
      }
    }
  }

  const createChatRoom = async (classID) => {
    const response = await makeGet(`users/getClass/${classID}`)
    if (response && response.data) {
      const classData = response.data
      const newRoom = {
        name: classData.className,
        tutor_id: classData.tutorID,
        class_id: +classData.classID
      }

      const { data, error } = await supabase.from('chat_rooms').insert([newRoom]).select()

      if (error) {
        console.log('Error creating chat room:', error)
        return
      } else {
        const newChatRoomID = data[0]?.class_id
        const { error: memberError } = await supabase.from('chat_room_members').insert([
          {
            chat_room_id: newChatRoomID,
            role: 'Tutor',
            user_id: user.userID,
            user_name: user.userName
          }
        ])

        if (memberError) {
          console.log('Error adding tutor member:', memberError)
          return
        }
        setSelectedRoom(classID)
      }
    }
  }
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(e.target)) {
        setSelectedRoom(null)
      }
    }

    if (selectedRoom) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedRoom])

  useEffect(() => {
    fetchRooms()
  }, [user])

  const toggleOpen = () => setIsOpen((prev) => !prev)

  return (
    <>
      <div className='fixed bottom-0 right-2 w-80 z-40 shadow-lg' style={{ maxWidth: 'calc(100vw - 20px)' }}>
        {/* Header */}
        <div
          onClick={toggleOpen}
          className='bg-blue-600 text-white p-3 rounded-t-lg cursor-pointer flex justify-between items-center'
        >
          <span className='font-semibold'>Chat rooms</span>
          <span className='text-white text-sm'>{isOpen ? '▼' : '▲'}</span>
        </div>

        {/* Room list */}
        <div
          className={`bg-white text-blue-800 transition-all duration-300 overflow-auto ${
            isOpen ? 'max-h-96' : 'max-h-0'
          } ${selectedRoom ? 'hidden' : 'block'}`}
        >
          {classes.length > 0 ? (
            <ul className='divide-y divide-gray-200'>
              {classes.map((cls) => (
                <li
                  key={cls.classID}
                  className='p-3 hover:bg-gray-100 cursor-pointer'
                  onClick={() => {
                    handleSelectRoom(cls.classID)
                  }}
                >
                  {cls.className}
                </li>
              ))}
            </ul>
          ) : (
            <p className='px-2 py-6'>You haven't been added to any chat room</p>
          )}
        </div>

        {/* ChatBox hiển thị luôn bên dưới nếu có selectedRoom */}
        {selectedRoom && (
          <div className='h-96 bg-white border border-t-0 rounded-b-lg' ref={chatBoxRef}>
            <ChatBox user={user} classID={selectedRoom} onClose={() => setSelectedRoom(null)} />
          </div>
        )}
      </div>
    </>
  )
}

export default ChatRoomList
