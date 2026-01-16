'use client';

import { useState, useRef, useEffect } from 'react';

interface DanmakuInputProps {
  onSend: (text: string, videoTime: number) => void;
  videoPlayerRef: React.RefObject<any>;
  replyTo: any;
  onCancelReply: () => void;
}

export default function DanmakuInput({ onSend, videoPlayerRef, replyTo, onCancelReply }: DanmakuInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const handleSend = () => {
    if (!text.trim()) return;

    const videoTime = videoPlayerRef.current?.getCurrentTime() || 0;
    onSend(text, videoTime);
    setText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-700 rounded text-sm flex items-center justify-between">
          <div>
            <span className="text-blue-400">回复 {replyTo.user_name}:</span>
            <span className="ml-2 text-gray-300">{replyTo.text}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={replyTo ? `回复 ${replyTo.user_name}...` : "发送弹幕..."}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          maxLength={100}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all font-semibold"
        >
          发送
        </button>
      </div>
      
      <p className="mt-2 text-xs text-gray-400">
        💡 按 Enter 发送，点击飞过的弹幕可以回复
      </p>
    </div>
  );
}
