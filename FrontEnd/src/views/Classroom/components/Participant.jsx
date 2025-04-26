import React, { useEffect, useRef, useState } from 'react';
import { Track } from 'livekit-client';
import './Participant.css';

export const Participant = ({ participant, isLocal }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    // Function to handle track subscription
    const handleTrack = (track) => {
      if (track.kind === Track.Kind.Video && track.source === Track.Source.Camera) {
        setVideoTrack(track);
        setIsVideoMuted(track.isMuted);
        if (videoRef.current) {
          track.attach(videoRef.current);
        }
      } else if (track.kind === Track.Kind.Audio && track.source === Track.Source.Microphone) {
        setAudioTrack(track);
        setIsAudioMuted(track.isMuted);
        if (audioRef.current) {
          track.attach(audioRef.current);
        }
      }
    };

    // Get all tracks from the participant
    const tracks = participant.getTracks();
    tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        handleTrack(publication.track);
      }
    });

    // Set up event listeners for the participant
    const onTrackSubscribed = (track, publication) => handleTrack(track);
    const onTrackUnsubscribed = (track, publication) => {
      if (track.kind === Track.Kind.Video && track.source === Track.Source.Camera) {
        if (videoRef.current) {
          track.detach(videoRef.current);
        }
        setVideoTrack(null);
      } else if (track.kind === Track.Kind.Audio && track.source === Track.Source.Microphone) {
        if (audioRef.current) {
          track.detach(audioRef.current);
        }
        setAudioTrack(null);
      }
    };
    const onMuted = () => {
      if (videoTrack && videoTrack.source === Track.Source.Camera) {
        setIsVideoMuted(true);
      }
      if (audioTrack && audioTrack.source === Track.Source.Microphone) {
        setIsAudioMuted(true);
      }
    };
    const onUnmuted = () => {
      if (videoTrack && videoTrack.source === Track.Source.Camera) {
        setIsVideoMuted(false);
      }
      if (audioTrack && audioTrack.source === Track.Source.Microphone) {
        setIsAudioMuted(false);
      }
    };

    participant.on('trackSubscribed', onTrackSubscribed);
    participant.on('trackUnsubscribed', onTrackUnsubscribed);
    participant.on('trackMuted', onMuted);
    participant.on('trackUnmuted', onUnmuted);

    // Clean up when component unmounts
    return () => {
      participant.off('trackSubscribed', onTrackSubscribed);
      participant.off('trackUnsubscribed', onTrackUnsubscribed);
      participant.off('trackMuted', onMuted);
      participant.off('trackUnmuted', onUnmuted);

      if (videoTrack) {
        videoTrack.detach();
      }
      if (audioTrack) {
        audioTrack.detach();
      }
    };
  }, [participant]);

  return (
    <div className={`participant ${isLocal ? 'local' : 'remote'}`}>
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted={isLocal} />
        {isVideoMuted && <div className="video-muted">Camera Off</div>}
        <audio ref={audioRef} autoPlay muted={isLocal} />
      </div>
      <div className="participant-info">
        <div className="name">{participant.identity} {isLocal && '(You)'}</div>
        <div className="indicators">
          {isAudioMuted && <span className="indicator muted">🔇</span>}
        </div>
      </div>
    </div>
  );
}; 