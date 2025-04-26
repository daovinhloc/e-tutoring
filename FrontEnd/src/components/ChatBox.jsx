import { useEffect, useState, useRef } from 'react'
import supabase from '../apiService/supabase'

const ChatBox = ({ user, classID, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef(null)
  const [uId, setUId] = useState(null)
  const [memberMap, setMemberMap] = useState({})
  const [chatRoomName, setChatRoomName] = useState('')

  const getUUID = async () => {
    const { data, error } = await supabase
      .from('chat_room_members')
      .select('id')
      .eq('chat_room_id', classID)
      .eq('user_id', user.userID)
    if (!error && data.length) {
      setUId(data[0].id)
    }
    if (!error && data.length === 0) {
      const { data, error } = await supabase
        .from('chat_room_members')
        .insert([
          {
            chat_room_id: +classID,
            role: user.role,
            user_id: user.userID,
            user_name: user.userName
          }
        ])
        .select()
      if (data) {
        fetchMemberMap()
      }
    }
  }

  const fetchMemberMap = async () => {
    const { data, error } = await supabase
      .from('chat_room_members')
      .select(
        `
      id,
      user_name,
      role,
      chat_rooms (
        name
      )
    `
      )
      .eq('chat_room_id', classID)

    if (!error && data.length) {
      const map = {}
      data.forEach((member) => {
        map[member.id] = member.role === 'Tutor' ? 'Tutor of class' : member.user_name
      })

      setMemberMap(map)
      const roomName = data[0]?.chat_rooms?.name ?? ''
      setChatRoomName(roomName)
    }
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .eq('chat_room_id', classID)
      .order('created_at', { ascending: true })
    if (!error) setMessages(data)
  }

  const sendMessage = async () => {
    console.log(newMessage, uId)

    if (!newMessage.trim() || !uId) return
    await supabase.from('message').insert({
      chat_room_id: classID,
      sender_id: uId,
      content: newMessage
    })
    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const nowDate = new Date()
    if (date.getDate() === nowDate.getDate() && date.getMonth() === nowDate.getMonth()) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else
      return `${date.getDate().toString()}/${date.getMonth().toString()} - ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  useEffect(() => {
    getUUID()
    fetchMessages()
    fetchMemberMap()

    const channel = supabase
      .channel('chatroom-' + classID)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: `chat_room_id=eq.${classID}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classID])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='fixed bottom-4 right-4 w-full max-w-xs bg-white shadow-lg border border-gray-300 rounded-lg z-50 flex flex-col h-[520px]'>
      {/* Header */}
      <div className='flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-lg'>
        <h2 className='text-md text-white'>{chatRoomName} chat</h2>
        <button onClick={onClose} className='hover:text-gray-200 text-sm'>
          <i className='fa-solid fa-x'></i>
        </button>
      </div>

      {/* Message list */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-blue-900'>
        {messages.map((msg) => {
          const isMe = msg.sender_id === uId
          const senderName = isMe ? 'You' : memberMap[msg.sender_id] || 'User'
          return (
            <div key={msg.id} className={`max-w-[80%] ${isMe ? 'ml-auto text-right' : 'text-left'}`}>
              <div className='text-xs text-gray-500'>{senderName}</div>
              <div
                className={`inline-block px-4 py-2 rounded-lg text-sm ${
                  isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
              <div className='text-[10px] text-gray-400 mt-0.5'>{formatTime(msg.created_at)}</div>
            </div>
          )
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* Input */}
      <div className='p-2 border-t flex'>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
          }}
          placeholder='Type a message...'
          className='flex-1 text-black px-3 py-2 border rounded-xl mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
        <button onClick={sendMessage} className='bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700'>
          <i className='fa-solid fa-paper-plane'></i>
        </button>
      </div>
    </div>
  )
}

export default ChatBox
