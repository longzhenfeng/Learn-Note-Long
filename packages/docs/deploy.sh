#!/bin/bash

# 部署脚本 - 将文档部署到 GitHub Pages

echo "开始部署到 GitHub Pages..."

# 进入构建目录
cd .vitepress/dist

# 初始化 git 仓库
git init
git add -A
git commit -m "deploy docs"

# 推送到 gh-pages 分支
git push -f https://github.com/longzhenfeng/Learn-Note-Long.git main:gh-pages

echo "部署完成！"
echo "文档将在几分钟后访问: https://longzhenfeng.github.io/Learn-Note-Long/"
