import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react';
import { IoMdExpand, IoMdContract } from 'react-icons/io';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaRedo } from 'react-icons/fa';

// Import CSS the correct way
import './VideoRoom.css';

export const VideoRoom = ({ token, url, roomName, participantName, onLeaveRoom }) => {
  const [error, setError] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRoomRef = useRef(null);
  const roomRef = useRef(null);
  const [mediaPermissions, setMediaPermissions] = useState({
    video: false,
    audio: false,
    requested: false
  });
  const [hasPermission, setHasPermission] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Xác định vai trò người dùng từ tên
  const userRole = participantName.toLowerCase().includes('tutor') ? 'tutor' : 'student';

  // Request media permissions on component mount
  useEffect(() => {
    const requestMediaPermissions = async () => {
      try {
        setMediaPermissions(prev => ({ ...prev, requested: true }));
        
        // Thêm các ràng buộc cụ thể để khắc phục vấn đề camera
        const constraints = {
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        };
        
        // Request access to microphone and camera
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Check if we have permissions
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        
        setMediaPermissions({
          audio: audioTracks.length > 0 && audioTracks[0].enabled,
          video: videoTracks.length > 0 && videoTracks[0].enabled,
          requested: true
        });
        
        console.log('Media permissions granted:', { 
          audio: audioTracks.length > 0, 
          video: videoTracks.length > 0,
          videoSettings: videoTracks.length > 0 ? videoTracks[0].getSettings() : null
        });
        
        // Clean up the stream when component unmounts
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Error requesting media permissions:', err);
        setError(`Không thể truy cập camera: ${err.message || 'Không rõ lỗi'}. Vui lòng kiểm tra quyền truy cập và các ứng dụng đang sử dụng camera.`);
        setMediaPermissions({
          audio: false,
          video: false,
          requested: true
        });
      }
    };
    
    requestMediaPermissions();
  }, [retryCount]);

  // Handle connection errors
  const handleError = (err) => {
    console.error('Error connecting to LiveKit:', err);
    setError(`Lỗi kết nối: ${err.message || 'Không rõ lỗi'}`);
  };

  // Handle when the room is disconnected
  const handleDisconnected = () => {
    console.log('Disconnected from room');
    handleLeaveRoom();
  };
  
  // Hàm xử lý khi người dùng rời phòng
  const handleLeaveRoom = () => {
    // Tùy thuộc vào vai trò, chuyển hướng người dùng
    if (userRole === 'tutor') {
      window.location.href = '/manage-classes';
    } else {
      window.location.href = '/my-classes';
    }
    
    // Vẫn giữ onLeaveRoom để đảm bảo tính tương thích
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoRoomRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Hàm để thử lại kết nối camera
  const retryCamera = () => {
    setError('');
    setRetryCount(prev => prev + 1);
  };

  // Permission warning component
  const PermissionWarning = () => (
    <div className="media-permissions-warning">
      <h3>Vấn đề về thiết bị</h3>
      <p>
        {!mediaPermissions.audio && !mediaPermissions.video ? 
          'Không thể truy cập microphone và camera. Vui lòng kiểm tra:' :
          !mediaPermissions.audio ? 
            'Không thể truy cập microphone. Vui lòng kiểm tra:' :
            'Không thể truy cập camera. Vui lòng kiểm tra:'
        }
      </p>
      <ul className="troubleshoot-list">
        <li>Camera của bạn đã được kết nối đúng</li>
        <li>Không có ứng dụng nào khác đang sử dụng camera</li>
        <li>Bạn đã cấp quyền trong cài đặt trình duyệt</li>
        <li>Driver camera đã được cập nhật</li>
      </ul>
      <div className="permission-actions">
        <button onClick={retryCamera} className="retry-btn">
          <FaRedo /> Thử lại
        </button>
        <button onClick={() => window.location.reload()} className="reload-btn">
          Tải lại trang
        </button>
      </div>
    </div>
  );

  return (
    <div 
      ref={videoRoomRef} 
      className={`video-room ${isFullScreen ? 'fullscreen' : ''}`}
    >
      <div className="room-header">
        <h3>{roomName}</h3>
        <div className="room-controls">
          <button 
            className="fullscreen-btn" 
            onClick={toggleFullScreen}
            title={isFullScreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            {isFullScreen ? <IoMdContract /> : <IoMdExpand />}
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={retryCamera} className="retry-error-btn">
            <FaRedo /> Thử lại
          </button>
        </div>
      )}
      
      {mediaPermissions.requested && (!mediaPermissions.audio || !mediaPermissions.video) ? (
        <PermissionWarning />
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={url}
          options={{
            adaptiveStream: true,
            dynacast: true,
            publishDefaults: {
              simulcast: true,
            },
            videoCodec: 'vp8',  // Thêm codec rõ ràng
          }}
          video={cameraEnabled}
          audio={micEnabled}
          onDisconnected={handleDisconnected}
          onError={handleError}
          className="livekit-container"
          data-lk-theme="default"
        >
          <CustomVideoConference 
            chatEnabled={true}
            screenShareEnabled={true}
            participantName={participantName}
            onLeaveRoom={handleLeaveRoom}
          />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
};

// Custom VideoConference component for more control over the UI
const CustomVideoConference = ({ chatEnabled, screenShareEnabled, participantName, onLeaveRoom }) => {
  const { localParticipant } = useLocalParticipant();
  
  // Update the participant name if available
  useEffect(() => {
    if (localParticipant && participantName) {
      localParticipant.setName(participantName);
    }
  }, [localParticipant, participantName]);
  
  // Tùy chỉnh xử lý khi người dùng nhấn nút Leave
  const handleLeave = () => {
    // Gọi callback để xử lý rời phòng
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };
  
  return (
    <div className="custom-video-conference">
      <VideoConference 
        chatEnabled={chatEnabled} 
        screenShareEnabled={screenShareEnabled}
        onLeave={handleLeave}
      />
    </div>
  );
};