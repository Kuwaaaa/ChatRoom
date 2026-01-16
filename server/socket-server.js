import { Server as SocketIOServer } from 'socket.io';
import { roomDb, danmakuDb } from '@/lib/database';
import { nanoid } from 'nanoid';
// 房间状态管理
const rooms = new Map();
export function setupSocketIO(httpServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        // P2P 优化配置
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        // ========== Phase 1: 基础房间功能 ==========
        // 加入房间
        socket.on('join-room', ({ roomId, userId, userName, networkStats }) => {
            socket.join(roomId);
            // 初始化房间状态
            if (!rooms.has(roomId)) {
                const room = roomDb.findById(roomId);
                rooms.set(roomId, {
                    users: new Map(),
                    videoState: {
                        url: (room === null || room === void 0 ? void 0 : room.video_url) || null,
                        time: (room === null || room === void 0 ? void 0 : room.video_time) || 0,
                        isPlaying: (room === null || room === void 0 ? void 0 : room.is_playing) === 1
                    }
                });
            }
            const roomState = rooms.get(roomId);
            const isHost = roomState.users.size === 0; // 第一个加入的是房主
            // 添加用户
            const user = {
                userId,
                userName,
                socketId: socket.id,
                isHost,
                // P2P 扩展（预留）
                networkStats,
                role: evaluateUserRole(networkStats),
                peerConnections: []
            };
            roomState.users.set(userId, user);
            // 通知其他用户
            socket.to(roomId).emit('user-joined', {
                userId,
                userName,
                isHost,
                role: user.role, // P2P 扩展
                socketId: socket.id // P2P 扩展
            });
            // 返回房间信息
            socket.emit('room-joined', {
                roomId,
                isHost,
                users: Array.from(roomState.users.values()).map(u => ({
                    userId: u.userId,
                    userName: u.userName,
                    isHost: u.isHost,
                    role: u.role, // P2P 扩展
                    socketId: u.socketId // P2P 扩展
                })),
                videoState: roomState.videoState,
                danmakuHistory: danmakuDb.findByRoom(roomId, 100)
            });
            console.log(`👤 ${userName} joined room ${roomId} (host: ${isHost}, role: ${user.role})`);
        });
        // 离开房间
        socket.on('leave-room', ({ roomId, userId }) => {
            handleUserLeave(socket, roomId, userId);
        });
        // 断开连接
        socket.on('disconnect', () => {
            // 查找用户所在的房间
            rooms.forEach((roomState, roomId) => {
                roomState.users.forEach((user) => {
                    if (user.socketId === socket.id) {
                        handleUserLeave(socket, roomId, user.userId);
                    }
                });
            });
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
        // ========== Phase 1: 视频同步 ==========
        // 设置视频 URL
        socket.on('set-video', ({ roomId, videoUrl }) => {
            const roomState = rooms.get(roomId);
            if (!roomState)
                return;
            roomState.videoState.url = videoUrl;
            roomState.videoState.time = 0;
            roomState.videoState.isPlaying = false;
            // 持久化到数据库
            roomDb.updateVideoState(roomId, videoUrl, 0, false);
            // 广播给所有人
            io.to(roomId).emit('video-set', { videoUrl });
            console.log(`📹 Video set in room ${roomId}: ${videoUrl}`);
        });
        // 播放控制
        socket.on('video-play', ({ roomId, time }) => {
            const roomState = rooms.get(roomId);
            if (!roomState)
                return;
            roomState.videoState.time = time;
            roomState.videoState.isPlaying = true;
            roomDb.updateVideoState(roomId, roomState.videoState.url, time, true);
            socket.to(roomId).emit('video-play', { time });
            console.log(`▶️  Video play in room ${roomId} at ${time}s`);
        });
        socket.on('video-pause', ({ roomId, time }) => {
            const roomState = rooms.get(roomId);
            if (!roomState)
                return;
            roomState.videoState.time = time;
            roomState.videoState.isPlaying = false;
            roomDb.updateVideoState(roomId, roomState.videoState.url, time, false);
            socket.to(roomId).emit('video-pause', { time });
            console.log(`⏸️  Video pause in room ${roomId} at ${time}s`);
        });
        socket.on('video-seek', ({ roomId, time }) => {
            const roomState = rooms.get(roomId);
            if (!roomState)
                return;
            roomState.videoState.time = time;
            roomDb.updateVideoState(roomId, roomState.videoState.url, time, roomState.videoState.isPlaying);
            socket.to(roomId).emit('video-seek', { time });
            console.log(`⏩ Video seek in room ${roomId} to ${time}s`);
        });
        // ========== Phase 2: 弹幕系统 ==========
        // 发送弹幕
        socket.on('send-danmaku', ({ roomId, userId, userName, text, videoTime, replyTo }) => {
            const danmaku = {
                id: nanoid(),
                room_id: roomId,
                user_id: userId,
                user_name: userName,
                text,
                video_time: videoTime,
                reply_to: replyTo || null,
                timestamp: Date.now()
            };
            // 保存到数据库
            danmakuDb.create(danmaku);
            // 广播给所有人（Phase 1 用 WebSocket，Phase 4 可改为 P2P DataChannel）
            io.to(roomId).emit('danmaku-received', danmaku);
            console.log(`💬 Danmaku in room ${roomId} from ${userName}: ${text}`);
        });
        // ========== P2P 扩展接口（预留，Phase 4 实现）==========
        // WebRTC 信令转发
        socket.on('webrtc-signal', ({ to, signal, type }) => {
            io.to(to).emit('webrtc-signal', {
                from: socket.id,
                signal,
                type
            });
        });
        // ICE candidate 转发
        socket.on('ice-candidate', ({ to, candidate }) => {
            io.to(to).emit('ice-candidate', {
                from: socket.id,
                candidate
            });
        });
        // P2P 连接状态更新
        socket.on('p2p-connection-state', ({ roomId, userId, connectedPeers }) => {
            const roomState = rooms.get(roomId);
            if (!roomState)
                return;
            const user = roomState.users.get(userId);
            if (user) {
                user.peerConnections = connectedPeers;
            }
        });
        // P2P 消息路由（当 P2P 失败时通过服务器转发）
        socket.on('p2p-fallback-message', ({ roomId, message }) => {
            socket.to(roomId).emit('p2p-message', message);
        });
    });
    console.log('✅ Socket.IO server initialized');
    return io;
}
// 处理用户离开
function handleUserLeave(socket, roomId, userId) {
    const roomState = rooms.get(roomId);
    if (!roomState)
        return;
    const user = roomState.users.get(userId);
    if (!user)
        return;
    roomState.users.delete(userId);
    socket.leave(roomId);
    // 通知其他用户
    socket.to(roomId).emit('user-left', {
        userId,
        userName: user.userName
    });
    // 如果房间空了，清理房间状态
    if (roomState.users.size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️  Room ${roomId} cleaned up`);
    }
    else if (user.isHost) {
        // 如果房主离开，转移房主权限
        const newHost = Array.from(roomState.users.values())[0];
        newHost.isHost = true;
        socket.to(roomId).emit('host-changed', {
            newHostId: newHost.userId,
            newHostName: newHost.userName
        });
        console.log(`👑 New host in room ${roomId}: ${newHost.userName}`);
    }
    console.log(`👋 ${user.userName} left room ${roomId}`);
}
// 评估用户角色（P2P 扩展）
function evaluateUserRole(networkStats) {
    if (!networkStats)
        return 'normal';
    // 简单评估：带宽 >5Mbps 且延迟 <100ms → 超级节点
    if (networkStats.bandwidth > 5000 && networkStats.latency < 100) {
        return 'super';
    }
    return 'normal';
}
