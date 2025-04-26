import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Classroom.css'
import { VideoRoom } from './components/VideoRoom'

function Classroom() {
  const [roomInfo, setRoomInfo] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Parse query parameters for room name and participant name
    const searchParams = new URLSearchParams(location.search)
    const roomName = searchParams.get('room')
    const participantName = searchParams.get('name')

    // If both parameters are provided, automatically join the room
    if (roomName && participantName) {
      handleAutoJoin(roomName, participantName)
    } else {
      // Nếu không có tham số, chuyển hướng về trang chính
      const userRole = localStorage.getItem('userRole') || 'student'
      if (userRole === 'tutor') {
        navigate('/manage-classes')
      } else {
        navigate('/my-classes')
      }
    }
  }, [location, navigate])

  // Auto-join the room with provided parameters
  const handleAutoJoin = async (roomName, participantName) => {
    try {
      console.log(`Auto-joining room: ${roomName}, as: ${participantName}`)

      // Call API to get token
      const absoluteUrl = import.meta.env.VITE_API_URL + '/api/get-token'
      const response = await fetch(absoluteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomName,
          participantName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get token')
      }

      // Join the room with the received token
      setRoomInfo({
        token: data.token,
        url: data.url,
        roomName,
        participantName
      })
    } catch (error) {
      console.error('Error auto-joining room:', error)
      // Nếu không thể tham gia phòng, chuyển hướng về trang chính
      const userRole = (participantName || '').toLowerCase().includes('tutor') ? 'tutor' : 'student'
      if (userRole === 'tutor') {
        navigate('/manage-classes')
      } else {
        navigate('/my-classes')
      }
    }
  }

  // Xử lý khi người dùng rời phòng
  const handleLeaveRoom = () => {
    // Đã được xử lý trong VideoRoom component
  }

  return (
    <div className='classroom-page'>
      {roomInfo ? (
        <VideoRoom
          token={roomInfo.token}
          url={roomInfo.url}
          roomName={roomInfo.roomName}
          participantName={roomInfo.participantName}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <div className='loading-container'>
          <p>Đang kết nối đến phòng học...</p>
        </div>
      )}
    </div>
  )
}

export default Classroom
