'use client';

import { useEffect, useRef } from 'react';

interface Danmaku {
  id: string;
  user_name: string;
  text: string;
  video_time: number;
  reply_to: string | null;
  timestamp: number;
}

interface ChatPanelProps {
  danmakuList: Danmaku[];
  onReply: (danmaku: Danmaku) => void;
}

export default function ChatPanel({ danmakuList, onReply }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [danmakuList]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="mr-2">💬</span>
        弹幕历史
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {danmakuList.map((danmaku) => (
          <div
            key={danmaku.id}
            className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition-all cursor-pointer"
            onClick={() => onReply(danmaku)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-blue-400">
                {danmaku.user_name}
              </span>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>🕒 {formatVideoTime(danmaku.video_time)}</span>
                <span>{formatTime(danmaku.timestamp)}</span>
              </div>
            </div>
            
            {danmaku.reply_to && (
              <div className="text-xs text-gray-400 mb-1">
                回复了某条弹幕
              </div>
            )}
            
            <p className="text-sm text-gray-200">{danmaku.text}</p>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
        
        {danmakuList.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            还没有弹幕，快来发送第一条吧！
          </p>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          💡 点击弹幕可以回复
        </p>
      </div>
    </div>
  );
}
