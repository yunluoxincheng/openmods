#!/bin/bash

# OpenMods 发布脚本
# 使用方法: ./script/publish.sh

set -e

echo "📦 开始发布 OpenMods 到 npm..."

# 检查是否已登录 npm
echo "检查 npm 登录状态..."
if ! npm whoami &>/dev/null; then
    echo "❌ 请先登录 npm: npm login"
    exit 1
fi

# 获取当前版本
VERSION=$(cat packages/core/package.json | grep '"version"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
echo "发布版本: $VERSION"

# 发布依赖包
echo ""
echo "1️⃣ 发布 @openmods-ai/util..."
cd packages/util
npm publish --access public
cd ../..

echo ""
echo "2️⃣ 发布 @openmods-ai/script..."
cd packages/script
npm publish --access public
cd ../..

echo ""
echo "3️⃣ 发布 @openmods-ai/sdk..."
cd packages/sdk/js
npm publish --access public
cd ../../..

echo ""
echo "4️⃣ 发布 @openmods-ai/plugin..."
cd packages/plugin
npm publish --access public
cd ../..

echo ""
echo "5️⃣ 发布 openmods-ai..."
cd packages/core
npm publish --access public
cd ../..

echo ""
echo "✅ 发布完成！"
echo ""
echo "用户可以通过以下命令安装："
echo "  npm install -g openmods-ai"
echo "  bun install -g openmods-ai"