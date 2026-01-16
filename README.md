# 🎬 WebRTC P2P 视频观看室

基于 WebRTC P2P 技术的实时视频同步观看应用，支持多人一起看视频、实时弹幕互动和进度同步。

## 📺 在线演示

**沙盒测试地址**: https://3000-iscsdkljnrzubq6uootlt-5634da27.sandbox.novita.ai

## ✨ 已完成功能 (Phase 1 & 2)

### Phase 1 - 核心功能 ✅
- ✅ **房间系统**
  - 创建房间（自动生成唯一 ID）
  - 加入房间（通过房间列表或直接链接）
  - 房间列表（显示所有活跃房间）
  - 用户昵称系统（本地存储）

- ✅ **视频播放**
  - 支持外链视频（MP4、M3U8 等格式）
  - 自定义视频播放器（播放/暂停/进度条/音量控制）
  - 房主控制模式（房主控制播放，其他人同步）
  - 实时进度同步（精确到毫秒）

- ✅ **WebSocket 通信**
  - Socket.IO 实时连接
  - 用户上线/下线通知
  - 房主权限转移（房主离开时自动转移）
  - 网络状态监控

### Phase 2 - 弹幕系统 ✅
- ✅ **弹幕功能**
  - 实时弹幕发送（飞屏动画）
  - 弹幕回复功能（点击弹幕回复）
  - 弹幕历史记录（侧边栏显示）
  - 弹幕持久化（SQLite 数据库）
  - 按视频时间戳记录弹幕

- ✅ **数据持久化**
  - SQLite 数据库存储
  - 房间信息持久化
  - 弹幕历史存档
  - 视频状态保存

## 🚀 技术栈

### 前端
- **Next.js 14** (App Router) - React 框架
- **Socket.IO Client** - WebSocket 实时通信
- **TailwindCSS** - 样式框架
- **TypeScript** - 类型安全

### 后端
- **Node.js** + **Next.js Custom Server** - 自定义服务器
- **Socket.IO** - WebSocket 服务器
- **better-sqlite3** - SQLite 数据库
- **PM2** - 进程管理

### 基础设施
- **PM2** - 守护进程管理
- **Git** - 版本控制

## 📁 项目结构

```
webapp/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 首页（房间列表）
│   ├── room/[id]/page.tsx    # 房间页面
│   ├── api/rooms/route.ts    # 房间 API
│   ├── layout.tsx            # 布局组件
│   └── globals.css           # 全局样式
├── components/               # React 组件
│   ├── VideoPlayer.tsx       # 视频播放器
│   ├── DanmakuOverlay.tsx    # 弹幕叠加层
│   ├── DanmakuInput.tsx      # 弹幕输入框
│   ├── ChatPanel.tsx         # 聊天面板
│   └── UserList.tsx          # 用户列表
├── lib/                      # 工具库
│   ├── database.ts           # 数据库操作
│   ├── socket.ts             # Socket.IO 客户端
│   └── types.ts              # TypeScript 类型
├── server/                   # 服务器端代码
│   └── socket-server.ts      # Socket.IO 服务器
├── data/                     # 数据目录
│   └── rooms.db              # SQLite 数据库
├── logs/                     # 日志目录
├── server.ts                 # 自定义服务器入口
├── ecosystem.config.cjs      # PM2 配置
├── package.json              # 依赖管理
└── README.md                 # 本文档
```

## 🛠️ 安装和运行

### 前置要求
- Node.js 18+
- npm 或 yarn
- PM2 (可选，用于生产环境)

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd webapp

# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev

# 或使用 PM2
pm2 start ecosystem.config.cjs
```

### 生产部署

```bash
# 构建生产版本
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.cjs

# 查看日志
pm2 logs webapp

# 重启服务
pm2 restart webapp
```

## 🎮 使用指南

### 创建房间
1. 访问首页
2. 输入你的昵称
3. 输入房间名称
4. 点击"创建房间"

### 加入房间
1. 在首页房间列表中选择房间
2. 或通过直接链接加入房间

### 观看视频
1. 进入房间后，房主可以点击"设置视频链接"
2. 输入视频外链（支持 MP4、M3U8 等）
3. 房主控制播放，所有人同步观看

### 发送弹幕
1. 在视频下方的输入框输入弹幕内容
2. 按 Enter 或点击"发送"按钮
3. 点击飞过的弹幕可以回复

## 📊 数据库结构

### rooms 表
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  host_id TEXT NOT NULL,
  video_url TEXT,
  video_time REAL DEFAULT 0,
  is_playing INTEGER DEFAULT 0
);
```

### danmaku 表
```sql
CREATE TABLE danmaku (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  video_time REAL NOT NULL,
  reply_to TEXT,
  timestamp INTEGER NOT NULL
);
```

## 🚧 未来计划

### Phase 3 - 视频上传和存储 (未开始)
- [ ] 视频文件上传功能
- [ ] 视频转码（多码率）
- [ ] 视频列表管理
- [ ] 视频分片流式传输（HLS/DASH）
- [ ] 缩略图生成

### Phase 4 - WebRTC P2P (未开始)
- [ ] **P2P DataChannel**（弹幕走 P2P）
- [ ] **Hybrid Mesh 网络**（<10人优化）
- [ ] **WebTorrent 视频分发**（P2P 视频传输）
- [ ] **消息路由优化**（优先 P2P，回退 WebSocket）
- [ ] **网络质量评估**（自动选择超级节点）

### Phase 5 - WebRTC 音视频通话 (未开始)
- [ ] 房间内语音聊天
- [ ] 摄像头视频通话
- [ ] STUN/TURN 服务器配置
- [ ] NAT 穿透优化

### Phase 6 - 高级功能 (未开始)
- [ ] 用户注册/登录系统
- [ ] 房间权限管理（公开/私密/密码）
- [ ] 弹幕屏蔽/过滤
- [ ] 视频播放列表
- [ ] 房间录制功能

## 🎯 P2P 扩展接口（已预留）

项目已在以下模块预留 P2P 扩展接口：

### Socket.IO 服务器 (`server/socket-server.ts`)
- ✅ 用户角色评估（super/normal 节点）
- ✅ 网络状态上报接口
- ✅ WebRTC 信令转发接口
- ✅ ICE candidate 转发
- ✅ P2P 连接状态更新
- ✅ P2P 消息回退路由

### 客户端 (`lib/socket.ts`)
- ✅ P2PExtension 接口定义
- ✅ P2PMessageRouter 路由器
- ✅ 消息优先级路由（critical/high/normal/low）
- ✅ P2P 优先，WebSocket 回退策略

### 用户列表 (`components/UserList.tsx`)
- ✅ 显示用户角色（超级节点标识）
- ✅ 网络质量指示器

## 📱 移动端支持

- ✅ 响应式布局（Tailwind CSS）
- ✅ 触摸友好的UI
- ✅ 移动端弹幕优化（字体大小调整）
- ✅ 侧边栏折叠（移动端）

## 🔧 脚本命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 生产模式启动

# 数据库
npm run db:reset         # 重置数据库

# 端口管理
npm run clean-port       # 清理 3000 端口
```

## 📝 环境变量

```bash
PORT=3000                # 服务器端口
NODE_ENV=development     # 环境模式
```

## 🐛 已知问题

1. **首次加载慢**: Next.js 开发模式需要编译时间
2. **移动端弹幕性能**: 大量弹幕时可能影响性能
3. **房主离开**: 房主离开后权限转移可能延迟

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- GitHub: [Your GitHub]
- Email: [Your Email]

---

**当前版本**: Phase 1 & 2 (MVP)  
**最后更新**: 2026-01-16  
**状态**: ✅ 可用（沙盒测试）

## 🙏 致谢

- Next.js Team
- Socket.IO Team
- Tailwind CSS Team
- better-sqlite3 Contributors
