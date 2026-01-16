'use client';

import { useEffect, useRef, useState } from 'react';

interface Danmaku {
  id: string;
  user_name: string;
  text: string;
  video_time: number;
  reply_to: string | null;
  timestamp: number;
}

interface DanmakuOverlayProps {
  danmakuList: Danmaku[];
  onDanmakuClick: (danmaku: Danmaku) => void;
}

interface FloatingDanmaku {
  id: string;
  text: string;
  userName: string;
  top: number;
  animationDuration: number;
  danmaku: Danmaku;
}

export default function DanmakuOverlay({ danmakuList, onDanmakuClick }: DanmakuOverlayProps) {
  const [floatingDanmaku, setFloatingDanmaku] = useState<FloatingDanmaku[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackUsageRef = useRef<number[]>([]); // 记录每个轨道的使用情况

  useEffect(() => {
    if (danmakuList.length === 0) return;

    // 只处理最新的弹幕
    const latestDanmaku = danmakuList[danmakuList.length - 1];
    
    // 检查是否已经显示过
    if (floatingDanmaku.some(d => d.id === latestDanmaku.id)) {
      return;
    }

    // 计算可用轨道
    const containerHeight = containerRef.current?.clientHeight || 0;
    const trackHeight = 40; // 每条弹幕占用高度
    const totalTracks = Math.floor(containerHeight / trackHeight);
    
    // 找到可用轨道
    let trackIndex = 0;
    const now = Date.now();
    
    for (let i = 0; i < totalTracks; i++) {
      const lastUsed = trackUsageRef.current[i] || 0;
      if (now - lastUsed > 1000) { // 1秒后可复用
        trackIndex = i;
        break;
      }
    }
    
    trackUsageRef.current[trackIndex] = now;

    const newFloating: FloatingDanmaku = {
      id: latestDanmaku.id,
      text: latestDanmaku.text,
      userName: latestDanmaku.user_name,
      top: trackIndex * trackHeight,
      animationDuration: 10,
      danmaku: latestDanmaku
    };

    setFloatingDanmaku(prev => [...prev, newFloating]);

    // 10秒后移除
    setTimeout(() => {
      setFloatingDanmaku(prev => prev.filter(d => d.id !== latestDanmaku.id));
    }, 10000);
  }, [danmakuList, floatingDanmaku]);

  return (
    <div 
      ref={containerRef}
      className="danmaku-container"
      style={{ pointerEvents: 'none' }}
    >
      {floatingDanmaku.map((dm) => (
        <div
          key={dm.id}
          className="danmaku-item"
          style={{
            top: `${dm.top}px`,
            animationDuration: `${dm.animationDuration}s`,
            pointerEvents: 'auto'
          }}
          onClick={() => onDanmakuClick(dm.danmaku)}
        >
          <span className="text-blue-400 font-semibold mr-1">{dm.userName}:</span>
          {dm.text}
        </div>
      ))}
    </div>
  );
}
