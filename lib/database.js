import Database from 'better-sqlite3';
import path from 'path';
// 数据库实例（单例）
let db = null;
export function getDatabase() {
    if (!db) {
        const dbPath = path.join(process.cwd(), 'data', 'rooms.db');
        db = new Database(dbPath);
        // 初始化数据库结构
        initDatabase(db);
    }
    return db;
}
function initDatabase(db) {
    // 房间表
    db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      host_id TEXT NOT NULL,
      video_url TEXT,
      video_time REAL DEFAULT 0,
      is_playing INTEGER DEFAULT 0
    )
  `);
    // 弹幕表
    db.exec(`
    CREATE TABLE IF NOT EXISTS danmaku (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      video_time REAL NOT NULL,
      reply_to TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);
    // 创建索引
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_danmaku_room_id ON danmaku(room_id);
    CREATE INDEX IF NOT EXISTS idx_danmaku_video_time ON danmaku(room_id, video_time);
  `);
    console.log('✅ Database initialized');
}
// CRUD 操作
export const roomDb = {
    create: (room) => {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT INTO rooms (id, name, created_at, host_id, video_url, video_time, is_playing)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(room.id, room.name, room.created_at, room.host_id, room.video_url, room.video_time, room.is_playing);
        return room;
    },
    findById: (id) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
        return stmt.get(id);
    },
    findAll: () => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM rooms ORDER BY created_at DESC LIMIT 50');
        return stmt.all();
    },
    updateVideoState: (roomId, videoUrl, videoTime, isPlaying) => {
        const db = getDatabase();
        const stmt = db.prepare(`
      UPDATE rooms SET video_url = ?, video_time = ?, is_playing = ? WHERE id = ?
    `);
        stmt.run(videoUrl, videoTime, isPlaying ? 1 : 0, roomId);
    },
    delete: (id) => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
        stmt.run(id);
    }
};
export const danmakuDb = {
    create: (danmaku) => {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT INTO danmaku (id, room_id, user_id, user_name, text, video_time, reply_to, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(danmaku.id, danmaku.room_id, danmaku.user_id, danmaku.user_name, danmaku.text, danmaku.video_time, danmaku.reply_to, danmaku.timestamp);
        return danmaku;
    },
    findByRoom: (roomId, limit = 100) => {
        const db = getDatabase();
        const stmt = db.prepare(`
      SELECT * FROM danmaku 
      WHERE room_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(roomId, limit).reverse();
    },
    findByVideoTime: (roomId, startTime, endTime) => {
        const db = getDatabase();
        const stmt = db.prepare(`
      SELECT * FROM danmaku 
      WHERE room_id = ? AND video_time BETWEEN ? AND ?
      ORDER BY video_time ASC
    `);
        return stmt.all(roomId, startTime, endTime);
    }
};
