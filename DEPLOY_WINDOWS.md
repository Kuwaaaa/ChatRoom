# Windows 部署指南

## 前置要求

1. **Node.js 18+**  
   下载地址: https://nodejs.org/  
   选择 LTS 版本（推荐 18.x 或 20.x）

2. **Git**（可选，用于克隆仓库）  
   下载地址: https://git-scm.com/

## 快速开始

### 方法 1: 使用启动脚本（最简单）

1. 下载项目到本地
2. 双击 `start.bat`
3. 等待依赖安装和项目构建
4. 浏览器访问 http://localhost:3000

### 方法 2: 手动安装

```cmd
# 1. 克隆项目（或下载 ZIP）
git clone https://github.com/Kuwaaaa/ChatRoom.git
cd ChatRoom

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 启动服务
npm run dev
```

## 常见问题

### 1. 端口 3000 被占用

**方法 A: 修改端口**
```cmd
# 编辑 server.ts 第 9 行
const port = parseInt(process.env.PORT || '3000', 10);
# 改为
const port = parseInt(process.env.PORT || '8080', 10);
```

**方法 B: 关闭占用进程**
```cmd
# 查找占用进程
netstat -ano | findstr :3000

# 杀死进程（替换 PID）
taskkill /PID <进程ID> /F
```

### 2. npm install 失败

**切换国内镜像源：**
```cmd
npm config set registry https://registry.npmmirror.com
npm install
```

### 3. 编译错误

**清理缓存重新构建：**
```cmd
rmdir /s /q .next
rmdir /s /q node_modules
npm install
npm run build
```

### 4. tsx 命令找不到

**本地安装 tsx：**
```cmd
npm install --save-dev tsx
```

## 生产环境部署（Windows Server）

### 使用 PM2（推荐）

```cmd
# 安装 PM2（全局）
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.cjs

# 查看状态
pm2 list

# 查看日志
pm2 logs webapp

# 重启服务
pm2 restart webapp

# 停止服务
pm2 stop webapp
```

### 使用 Windows 服务

```cmd
# 安装 node-windows
npm install -g node-windows

# 创建服务安装脚本 install-service.js
```

**install-service.js 内容：**
```javascript
const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'WebRTC Video Room',
  description: 'WebRTC P2P 视频观看室',
  script: path.join(__dirname, 'server.ts'),
  nodeOptions: [
    '--loader', 'tsx'
  ]
});

svc.on('install', function() {
  svc.start();
});

svc.install();
```

```cmd
# 运行安装脚本
node install-service.js
```

## 防火墙配置

**Windows 防火墙开放 3000 端口：**

1. 打开 Windows Defender 防火墙
2. 点击"高级设置"
3. 入站规则 → 新建规则
4. 选择"端口" → TCP → 特定本地端口 → 3000
5. 允许连接 → 完成

**或使用命令行：**
```cmd
netsh advfirewall firewall add rule name="WebRTC Video Room" dir=in action=allow protocol=TCP localport=3000
```

## 访问应用

- **本地**: http://localhost:3000
- **局域网**: http://你的电脑IP:3000
- **公网**（如果有公网IP）: http://你的公网IP:3000

查看本机 IP：
```cmd
ipconfig
```

## 更新项目

```cmd
# 停止服务
pm2 stop webapp

# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 启动服务
pm2 start webapp
```

## 数据备份

**备份数据库：**
```cmd
copy data\rooms.db data\rooms.db.backup
```

**定时备份脚本 backup.bat：**
```batch
@echo off
set BACKUP_DIR=backups
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
copy data\rooms.db "%BACKUP_DIR%\rooms_%DATE%_%TIME%.db"

echo Backup completed: %BACKUP_DIR%\rooms_%DATE%_%TIME%.db
```

使用 Windows 任务计划程序设置定时运行。

## 性能优化

### 1. 使用生产模式

```cmd
set NODE_ENV=production
npm run start
```

### 2. 限制内存使用

修改 ecosystem.config.cjs:
```javascript
max_memory_restart: '500M'
```

### 3. 启用压缩

安装 compression 中间件（可选）

## 故障排除

### 服务无法启动

1. 检查端口是否被占用
2. 查看日志文件：`logs/error.log`
3. 确认 Node.js 版本：`node -v`
4. 重新安装依赖：`npm ci`

### 数据库错误

```cmd
# 重置数据库
npm run db:reset
```

### 访问速度慢

- 检查网络连接
- 使用局域网访问
- 考虑部署到云服务器

## 技术支持

- GitHub Issues: https://github.com/Kuwaaaa/ChatRoom/issues
- 查看文档: README.md
- 在线演示: 查看 README 中的沙盒地址

---

**祝部署顺利！** 🎉
