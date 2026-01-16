import { NextRequest, NextResponse } from 'next/server';
import { roomDb } from '@/lib/database';

// GET - 获取房间列表
export async function GET() {
  try {
    const rooms = roomDb.findAll();
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST - 创建房间
export async function POST(request: NextRequest) {
  try {
    const { roomId, roomName } = await request.json();
    
    if (!roomId || !roomName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const room = roomDb.create({
      id: roomId,
      name: roomName,
      created_at: Date.now(),
      host_id: '', // 将在 Socket.IO 连接时设置
      video_url: null,
      video_time: 0,
      is_playing: 0
    });
    
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
