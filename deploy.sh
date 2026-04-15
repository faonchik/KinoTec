#!/bin/bash

# Скрипт для автоматического деплоя на хост
# Использование: ./deploy.sh

set -e

HOST_IP="${HOST_IP:-31.31.197.17}"
SSH_USER="${SSH_USER:-u3350084}"
PROJECT_DIR="${PROJECT_DIR:-/www/kinoteck.ru/www}"

echo "🚀 Starting deployment to $SSH_USER@$HOST_IP..."

# Проверяем подключение
echo "🔌 Testing SSH connection..."
ssh -o StrictHostKeyChecking=no $SSH_USER@$HOST_IP "echo '✅ SSH connection successful'"

# Деплой
ssh -o StrictHostKeyChecking=no $SSH_USER@$HOST_IP << EOF
  set -e
  echo "📂 Changing to project directory: $PROJECT_DIR"
  
  # Определяем путь к проекту
  if [ -d "/www/kinoteck.ru/www" ]; then
    cd /www/kinoteck.ru/www
  elif [ -d "/var/www/kinoteck.ru" ]; then
    cd /var/www/kinoteck.ru
  elif [ -d "\$HOME/www" ]; then
    cd \$HOME/www
  else
    echo "❌ Project directory not found!"
    exit 1
  fi
  
  echo "📥 Pulling latest changes from Git..."
  git fetch origin
  git reset --hard origin/main || git reset --hard origin/master
  
  echo "🛑 Stopping containers..."
  docker-compose down || true
  
  echo "🔨 Building containers..."
  docker-compose build --no-cache
  
  echo "🚀 Starting containers..."
  docker-compose up -d
  
  echo "⏳ Waiting for services to start..."
  sleep 15
  
  echo "📊 Running database migrations..."
  docker-compose exec -T app npx prisma generate || true
  docker-compose exec -T app npx prisma migrate deploy || true
  
  echo "✅ Deployment completed!"
  docker-compose ps
EOF

echo "🎉 Deployment finished successfully!"

