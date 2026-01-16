'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import VideoPlayer from '@/components/VideoPlayer';
import DanmakuOverlay from '@/components/DanmakuOverlay';
import DanmakuInput from '@/components/DanmakuInput';
import ChatPanel from '@/components/ChatPanel';
import UserList from '@/components/UserList';
import { nanoid } from 'nanoid';

interface User {
  userId: string;
  userName: string;
  isHost: boolean;
  role?: 'super' | 'normal';
  socketId?: string;
}

interface Danmaku {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  text: string;
  video_time: number;
  reply_to: string | null;
  timestamp: number;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const userName = searchParams.get('name') || '访客';
  
  const [userId] = useState(() => nanoid());
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const [replyTo, setReplyTo] = useState<Danmaku | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const socketRef = useRef(getSocket());
  const videoPlayerRef = useRef<any>(null);

  useEffect(() => {
    const socket = socketRef.current;
    
    // 连接 Socket.IO
    socket.on('connect', () => {
      setIsConnected(true);
      
      // 加入房间
      socket.emit('join-room', {
        roomId,
        userId,
        userName,
        // P2P 扩展：网络状态（预留）
        networkStats: {
          bandwidth: 0,
          latency: 0,
          natType: 'unknown'
        }
      });
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    // 房间加入成功
    socket.on('room-joined', ({ isHost: host, users: roomUsers, videoState, danmakuHistory }) => {
      setIsHost(host);
      setUsers(roomUsers);
      
      if (videoState.url) {
        setVideoUrl(videoState.url);
        // 同步视频状态
        if (videoPlayerRef.current) {
          videoPlayerRef.current.setTime(videoState.time);
          if (videoState.isPlaying) {
            videoPlayerRef.current.play();
          }
        }
      }
      
      setDanmakuList(danmakuHistory);
    });
    
    // 用户加入
    socket.on('user-joined', ({ userId: newUserId, userName: newUserName, isHost: newIsHost, role, socketId }) => {
      setUsers(prev => [...prev, { 
        userId: newUserId, 
        userName: newUserName, 
        isHost: newIsHost,
        role,
        socketId
      }]);
    });
    
    // 用户离开
    socket.on('user-left', ({ userId: leftUserId }) => {
      setUsers(prev => prev.filter(u => u.userId !== leftUserId));
    });
    
    // 房主变更
    socket.on('host-changed', ({ newHostId }) => {
      setUsers(prev => prev.map(u => ({
        ...u,
        isHost: u.userId === newHostId
      })));
      if (newHostId === userId) {
        setIsHost(true);
      }
    });
    
    // 视频设置
    socket.on('video-set', ({ videoUrl: url }) => {
      setVideoUrl(url);
    });
    
    // 视频播放控制
    socket.on('video-play', ({ time }) => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.setTime(time);
        videoPlayerRef.current.play();
      }
    });
    
    socket.on('video-pause', ({ time }) => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.setTime(time);
        videoPlayerRef.current.pause();
      }
    });
    
    socket.on('video-seek', ({ time }) => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.setTime(time);
      }
    });
    
    // 弹幕
    socket.on('danmaku-received', (danmaku: Danmaku) => {
      setDanmakuList(prev => [...prev, danmaku]);
    });
    
    return () => {
      socket.emit('leave-room', { roomId, userId });
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('host-changed');
      socket.off('video-set');
      socket.off('video-play');
      socket.off('video-pause');
      socket.off('video-seek');
      socket.off('danmaku-received');
    };
  }, [roomId, userId, userName]);

  // 设置视频
  const handleSetVideo = () => {
    const url = prompt('请输入视频链接（支持 MP4、M3U8 等）:');
    if (url) {
      socketRef.current.emit('set-video', { roomId, videoUrl: url });
      setVideoUrl(url);
    }
  };

  // 视频播放控制
  const handlePlay = (time: number) => {
    if (isHost) {
      socketRef.current.emit('video-play', { roomId, time });
    }
  };

  const handlePause = (time: number) => {
    if (isHost) {
      socketRef.current.emit('video-pause', { roomId, time });
    }
  };

  const handleSeek = (time: number) => {
    if (isHost) {
      socketRef.current.emit('video-seek', { roomId, time });
    }
  };

  // 发送弹幕
  const handleSendDanmaku = (text: string, videoTime: number) => {
    socketRef.current.emit('send-danmaku', {
      roomId,
      userId,
      userName,
      text,
      videoTime,
      replyTo: replyTo?.id || null
    });
    
    setReplyTo(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-blue-400 hover:text-blue-300">
              ← 返回
            </a>
            <h1 className="text-xl font-bold">房间: {roomId}</h1>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-400">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {userName} {isHost && '👑'}
            </span>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all lg:hidden"
            >
              💬 聊天
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-3">
            {/* Controls */}
            {isHost && (
              <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={handleSetVideo}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                >
                  📹 设置视频链接
                </button>
                <p className="mt-2 text-sm text-gray-400">
                  作为房主，你可以控制视频播放
                </p>
              </div>
            )}

            {/* Video Player with Danmaku */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {videoUrl ? (
                <>
                  <VideoPlayer
                    ref={videoPlayerRef}
                    src={videoUrl}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    isHost={isHost}
                  />
                  <DanmakuOverlay
                    danmakuList={danmakuList}
                    onDanmakuClick={(danmaku) => setReplyTo(danmaku)}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">等待房主设置视频...</p>
                </div>
              )}
            </div>

            {/* Danmaku Input */}
            {videoUrl && (
              <DanmakuInput
                onSend={handleSendDanmaku}
                videoPlayerRef={videoPlayerRef}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className={`lg:block ${showChat ? 'block' : 'hidden'} space-y-4`}>
            {/* User List */}
            <UserList users={users} />
            
            {/* Chat Panel */}
            <ChatPanel danmakuList={danmakuList} onReply={setReplyTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
