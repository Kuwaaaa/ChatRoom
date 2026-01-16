// 用户类型
export interface User {
  userId: string;
  userName: string;
  isHost: boolean;
  role?: 'super' | 'normal';
  socketId?: string;
}

// 弹幕类型
export interface Danmaku {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  text: string;
  video_time: number;
  reply_to: string | null;
  timestamp: number;
}

// 房间类型
export interface Room {
  id: string;
  name: string;
  created_at: number;
  host_id: string;
  video_url: string | null;
  video_time: number;
  is_playing: number;
}

// 视频状态类型
export interface VideoState {
  url: string | null;
  time: number;
  isPlaying: boolean;
}
