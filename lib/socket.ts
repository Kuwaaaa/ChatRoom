'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }
  
  return socket;
}

// P2P 扩展工具（预留，Phase 4 实现）
export interface P2PExtension {
  // WebRTC 相关
  peerConnections: Map<string, RTCPeerConnection>;
  dataChannels: Map<string, RTCDataChannel>;
  
  // 连接到 peer
  connectToPeer: (peerId: string, isInitiator: boolean) => Promise<void>;
  
  // 发送 P2P 消息
  sendP2PMessage: (peerId: string, message: any) => boolean;
  
  // 广播 P2P 消息
  broadcastP2P: (message: any) => number;
}

// P2P 消息路由器（预留）
export class P2PMessageRouter {
  private socket: Socket;
  private p2p: P2PExtension | null = null;
  
  constructor(socket: Socket) {
    this.socket = socket;
  }
  
  // 设置 P2P 扩展
  setP2P(p2p: P2PExtension) {
    this.p2p = p2p;
  }
  
  // 智能路由：优先 P2P，失败回退 WebSocket
  send(roomId: string, event: string, data: any, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') {
    if (priority === 'critical') {
      // 关键消息：只走 WebSocket
      this.socket.emit(event, { roomId, ...data });
      return;
    }
    
    if (this.p2p) {
      // 尝试 P2P
      const successCount = this.p2p.broadcastP2P({ event, data });
      
      if (successCount === 0 || priority === 'high') {
        // P2P 失败或高优先级：回退到 WebSocket
        this.socket.emit(event, { roomId, ...data });
      }
    } else {
      // 没有 P2P：使用 WebSocket
      this.socket.emit(event, { roomId, ...data });
    }
  }
}
