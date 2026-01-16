'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function HomePage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 读取用户名
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }

    // 获取房间列表
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim() || !userName.trim()) {
      alert('请输入房间名和用户名');
      return;
    }

    const roomId = nanoid(10);
    
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, roomName })
      });

      if (res.ok) {
        localStorage.setItem('userName', userName);
        router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('创建房间失败');
    }
  };

  const joinRoom = (roomId: string) => {
    if (!userName.trim()) {
      alert('请输入用户名');
      return;
    }

    localStorage.setItem('userName', userName);
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎬 一起看视频
          </h1>
          <p className="text-gray-400 text-lg">
            基于 WebRTC P2P 的实时视频观看室
          </p>
        </div>

        {/* 创建房间 */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">🚀</span>
              创建房间
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  你的昵称
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="请输入昵称"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  房间名称
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="请输入房间名称"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  maxLength={50}
                />
              </div>

              <button
                onClick={createRoom}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                创建房间
              </button>
            </div>
          </div>
        </div>

        {/* 房间列表 */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2">📋</span>
            现有房间
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <p className="text-gray-400 text-lg">暂无房间，创建一个吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                  onClick={() => joinRoom(room.id)}
                >
                  <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>🎬 {room.video_url ? '有视频' : '无视频'}</span>
                    <span>
                      {new Date(room.created_at).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={fetchRooms}
            className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
          >
            🔄 刷新列表
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>WebRTC P2P 实时视频观看室 · Phase 1 MVP</p>
        <p className="mt-2">支持外链视频 · 实时同步 · 弹幕互动</p>
      </div>
    </div>
  );
}
