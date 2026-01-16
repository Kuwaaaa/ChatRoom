# 🚀 快速部署指南

## Windows 系统

### 方法 1: 一键启动（推荐）

1. **下载项目**
   ```cmd
   git clone https://github.com/Kuwaaaa/ChatRoom.git
   cd ChatRoom
   ```

2. **双击运行**
   ```
   双击 start.bat
   ```

3. **访问应用**
   ```
   浏览器打开 http://localhost:3000
   ```

### 方法 2: 手动安装

```cmd
# 1. 安装依赖
npm install

# 2. 构建项目  
npm run build

# 3. 启动服务
npm run dev
```

详细说明请查看 [DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md)

---

## Linux / macOS 系统

### 方法 1: 一键启动（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Kuwaaaa/ChatRoom.git
cd ChatRoom

# 2. 运行启动脚本
./start.sh
```

### 方法 2: 手动安装

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动服务
npm run dev
```

详细说明请查看 [DEPLOY.md](./DEPLOY.md)

---

## 🐳 Docker 部署（即将支持）

```bash
# 构建镜像
docker build -t webrtc-video-room .

# 运行容器
docker run -d -p 3000:3000 webrtc-video-room
```

---

## ⚠️ 常见问题

### 端口被占用

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

**Linux/macOS:**
```bash
lsof -i :3000
kill -9 <PID>
```

### npm install 失败

**使用国内镜像：**
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 找不到 tsx 命令

```bash
npm install --save-dev tsx
```

---

## 📱 访问应用

- **本地**: http://localhost:3000
- **局域网**: http://你的IP:3000

查看本机 IP：
- Windows: `ipconfig`
- Linux/macOS: `ifconfig` 或 `ip addr`

---

## 🔄 更新代码

```bash
git pull origin main
npm install
npm run build
# 重启服务
```

---

## 📖 完整文档

- [README.md](./README.md) - 项目介绍
- [DEPLOY.md](./DEPLOY.md) - Linux 详细部署
- [DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md) - Windows 详细部署

---

**需要帮助？**  
GitHub Issues: https://github.com/Kuwaaaa/ChatRoom/issues
