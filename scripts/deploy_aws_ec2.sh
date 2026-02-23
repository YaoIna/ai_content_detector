#!/usr/bin/env bash
set -euo pipefail

# =========================
# Section 1: 基础环境安装（只需首次）
# =========================
sudo apt update
sudo apt install -y nginx git curl ca-certificates gnupg

# 安装 Node.js 20（若已安装可跳过）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm / pm2（若已安装可跳过）
sudo npm i -g pnpm pm2


# =========================
# Section 2: 获取项目代码（首次 clone）
# =========================
mkdir -p ~/apps
cd ~/apps
git clone <YOUR_GITHUB_REPO_URL> ai_content_detector
cd ~/apps/ai_content_detector
git checkout master

# 如果你已经有项目目录，改用下面两行更新：
# cd ~/apps/ai_content_detector
# git pull --ff-only origin master


# =========================
# Section 3: 安装依赖 + 构建前端
# 说明：当前 web 没有 build script，所以用 vite build
# =========================
cd ~/apps/ai_content_detector
pnpm install
pnpm --filter @ai-detector/web exec vite build


# =========================
# Section 4: 配置后端环境变量（.env）
# 说明：AWS 上通常不需要本地 VPN 代理，默认关闭
# =========================
cat > ~/apps/ai_content_detector/.env <<'ENVEOF'
PORT=3000
HOST=127.0.0.1

RATE_LIMIT_MAX=15
RATE_LIMIT_WINDOW_MS=60000

TEXT_PROVIDER=chatgpt
IMAGE_PROVIDER=chatgpt

CHATGPT_API_KEY=REPLACE_WITH_YOUR_KEY
CHATGPT_BASE_URL=https://api.openai.com/v1
CHATGPT_MODEL=gpt-4.1-mini

CHATGPT_PROXY_ENABLED=false
# CHATGPT_PROXY_URL=http://127.0.0.1:7003
ENVEOF
chmod 600 ~/apps/ai_content_detector/.env


# =========================
# Section 5: 启动后端（PM2 保活）
# =========================
cd ~/apps/ai_content_detector
pm2 start "pnpm --filter @ai-detector/api dev" --name ai-detector-api --cwd ~/apps/ai_content_detector
pm2 save

# 配置开机自启（首次执行会输出一条 sudo 命令，复制执行）
pm2 startup


# =========================
# Section 6: 发布前端静态文件到 /var/www（解决 /home 权限问题）
# =========================
sudo mkdir -p /var/www/ai-detector
sudo rsync -a --delete ~/apps/ai_content_detector/apps/web/dist/ /var/www/ai-detector/
sudo chown -R www-data:www-data /var/www/ai-detector
sudo find /var/www/ai-detector -type d -exec chmod 755 {} \;
sudo find /var/www/ai-detector -type f -exec chmod 644 {} \;


# =========================
# Section 7: Nginx 配置（修复 /health 重写循环）
# =========================
sudo tee /etc/nginx/sites-available/ai-detector >/dev/null <<'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10m;

    root /var/www/ai-detector;
    index index.html;

    # 直接代理后端健康检查
    location = /health {
        proxy_pass http://127.0.0.1:3000/health;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 前端 SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/ai-detector /etc/nginx/sites-enabled/ai-detector
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx


# =========================
# Section 8: 验证服务
# =========================
# 本机后端
curl -i http://127.0.0.1:3000/health

# 公网（把 IP 换成你的 EC2 Public IPv4）
curl -i http://<EC2_PUBLIC_IP>/health
curl -i http://<EC2_PUBLIC_IP>/

# 查看后端日志
pm2 logs ai-detector-api --lines 100
