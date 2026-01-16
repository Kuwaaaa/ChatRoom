# 🚀 部署到您的服务器指南

## 服务器要求

- **配置**: 2G 内存 / 2GHz CPU / 2M 带宽
- **系统**: Ubuntu/Debian Linux
- **Node.js**: 18.x 或更高
- **PM2**: 全局安装
- **公网IP**: 已具备

## 📦 部署步骤

### 1. 准备服务器环境

```bash
# SSH 连接到您的服务器
ssh user@your-server-ip

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Git
sudo apt install git -y
```

### 2. 部署项目

#### 方案 A: 从 GitHub 克隆（推荐）

```bash
# 克隆项目
cd /home/your-user
git clone https://github.com/your-username/webapp.git
cd webapp

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
pm2 start ecosystem.config.cjs

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 按提示执行输出的命令
```

#### 方案 B: 从沙盒下载（本次开发）

**在沙盒中打包：**
```bash
cd /home/user/webapp
tar -czf webapp.tar.gz --exclude=node_modules --exclude=.next --exclude=data --exclude=logs .
# 将 webapp.tar.gz 下载到本地
```

**在服务器中解压：**
```bash
# 上传 webapp.tar.gz 到服务器
scp webapp.tar.gz user@your-server-ip:/home/user/

# 在服务器上解压
cd /home/user
mkdir webapp
cd webapp
tar -xzf ../webapp.tar.gz

# 安装依赖
npm install

# 构建项目
npm run build

# 创建必要目录
mkdir -p data logs

# 启动服务
pm2 start ecosystem.config.cjs
pm2 save
```

### 3. 配置防火墙

```bash
# 允许 3000 端口
sudo ufw allow 3000/tcp

# 或者使用 iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

### 4. 配置 Nginx 反向代理（可选但推荐）

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/webapp
```

**Nginx 配置内容：**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名或IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket 支持
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.IO 路径
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 配置 SSL（可选但推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🔧 服务管理

### PM2 常用命令

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs webapp

# 实时日志
pm2 logs webapp --lines 100

# 重启服务
pm2 restart webapp

# 停止服务
pm2 stop webapp

# 删除服务
pm2 delete webapp

# 监控
pm2 monit
```

### 更新代码

```bash
# 从 Git 更新
cd /home/user/webapp
git pull origin main

# 重新安装依赖（如果 package.json 有变化）
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart webapp
```

## 📊 性能优化（针对 2M 带宽）

### 1. 启用 Nginx Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

### 2. 限制并发连接数

修改 `ecosystem.config.cjs`:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  MAX_CONNECTIONS: 10  // 限制最大连接数
}
```

### 3. 数据库优化

```bash
# 定期清理旧数据（建议每周执行）
sqlite3 /home/user/webapp/data/rooms.db <<EOF
DELETE FROM danmaku WHERE timestamp < strftime('%s', 'now', '-7 days') * 1000;
VACUUM;
EOF
```

## 🔒 安全建议

1. **更改默认端口**（可选）
   ```bash
   # 修改 ecosystem.config.cjs 中的 PORT
   PORT: 8080
   ```

2. **限制访问来源**
   ```bash
   # 只允许特定 IP 访问
   sudo ufw allow from 1.2.3.4 to any port 3000
   ```

3. **设置环境变量**
   ```bash
   # 创建 .env 文件
   echo "NODE_ENV=production" > .env
   echo "SECRET_KEY=your-secret-key" >> .env
   ```

## 🐛 故障排除

### 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :3000

# 杀死占用进程
sudo kill -9 <PID>

# 或使用
npm run clean-port
```

### 内存不足

```bash
# 查看内存使用
free -h

# 重启服务释放内存
pm2 restart webapp
```

### 查看详细日志

```bash
# 错误日志
tail -f /home/user/webapp/logs/error.log

# 输出日志
tail -f /home/user/webapp/logs/output.log

# 所有日志
pm2 logs webapp --lines 1000
```

## 📱 访问应用

- **本地**: http://localhost:3000
- **局域网**: http://your-server-local-ip:3000
- **公网**: http://your-server-public-ip:3000
- **域名**（如果配置了）: http://your-domain.com

## 🔄 后续升级

当您想升级到 Phase 3/4/5 时：

```bash
# 停止当前服务
pm2 stop webapp

# 备份数据库
cp data/rooms.db data/rooms.db.backup

# 拉取新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 启动服务
pm2 start webapp
```

## 💾 数据备份

建议定期备份数据库：

```bash
# 创建备份脚本
cat > /home/user/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /home/user/webapp/data/rooms.db /home/user/backups/rooms_$DATE.db
# 只保留最近 7 天的备份
find /home/user/backups -name "rooms_*.db" -mtime +7 -delete
EOF

chmod +x /home/user/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加：0 2 * * * /home/user/backup.sh
```

## 📞 需要帮助？

如果遇到问题，请查看：
- 项目 README.md
- PM2 日志: `pm2 logs webapp`
- 系统日志: `journalctl -u nginx`

---

**部署完成后，记得在 README.md 中更新生产环境 URL！** 🎉
