# Capacitor 移动端开发指南

本文档介绍如何使用 Capacitor 将 Vue 应用打包成 iOS 和 Android 原生应用。

## 📱 项目结构

```
vue-app/
├── src/                      # Vue 源代码
├── dist/                     # Vite 构建输出（被 Capacitor 使用）
├── ios/                      # iOS 原生项目（Xcode）
├── android/                  # Android 原生项目（Android Studio）
├── capacitor.config.ts       # Capacitor 配置文件
└── vite.config.ts            # Vite 配置（已优化移动端）
```

## 🔧 开发工作流程

### 1. Web 开发（推荐日常开发）
在浏览器中开发和测试：
```bash
pnpm dev
```
访问 `http://localhost:3001`

### 2. 构建 Web 应用
```bash
pnpm build
```
这会生成 `dist/` 目录，包含所有打包后的静态资源。

### 3. 同步到原生项目
每次修改代码并构建后，需要同步到原生项目：
```bash
# 同步到所有平台
pnpm run cap:sync

# 只同步到 iOS
pnpm run cap:sync:ios

# 只同步到 Android
pnpm run cap:sync:android
```

**什么时候需要运行 sync？**
- 修改了 Web 代码并重新构建后
- 安装了新的 Capacitor 插件后
- 修改了 `capacitor.config.ts` 配置后

### 4. 打开原生 IDE
```bash
# 打开 Xcode
pnpm run cap:open:ios

# 打开 Android Studio
pnpm run cap:open:android
```

### 5. 一键构建并打开
```bash
# iOS: 构建 + 同步 + 打开 Xcode
pnpm run cap:build:ios

# Android: 构建 + 同步 + 打开 Android Studio
pnpm run cap:build:android
```

## 🍎 iOS 开发

### 环境要求
- **macOS** 系统
- **Xcode**（从 App Store 安装）
- **CocoaPods**: `sudo gem install cocoapods`
- **Xcode Command Line Tools**: `xcode-select --install`

### 运行步骤
1. 运行 `pnpm run cap:build:ios` 打开 Xcode
2. 在 Xcode 顶部选择目标设备：
   - 选择模拟器（如 iPhone 15 Pro）
   - 或连接真机并选择你的设备
3. 点击运行按钮（▶️）或按 `Cmd + R`
4. 应用会在模拟器/真机上启动

### 真机调试
- 需要 Apple Developer 账号（免费或付费）
- 在 Xcode 中：Signing & Capabilities → Team → 选择你的账号
- 连接 iPhone 并信任电脑
- 首次安装需要在 iPhone 上：设置 → 通用 → VPN与设备管理 → 信任开发者

### iOS 调试工具
**Safari Web Inspector**（查看 JavaScript 控制台、DOM、网络）：
1. iPhone 上：设置 → Safari → 高级 → 启用"Web 检查器"
2. Mac 上：Safari → 开发 → [你的设备名] → Learn Note
3. 就像在浏览器中调试一样！

## 🤖 Android 开发

### 环境要求
- **Android Studio**（从官网下载：https://developer.android.com/studio）
- **Java JDK 17+**（Android Studio 会提示安装）
- **Android SDK**（通过 Android Studio 安装）

### 首次配置
1. 打开 Android Studio
2. 运行 `pnpm run cap:open:android` 会自动在 Android Studio 中打开项目
3. 等待 Gradle 同步完成（首次需要下载很多依赖，可能需要 10-20 分钟）
4. 如果提示安装 SDK 或其他工具，点击安装

### 运行步骤
1. 运行 `pnpm run cap:build:android` 打开 Android Studio
2. 选择运行设备：
   - **使用模拟器**：顶部工具栏 → Device Manager → 创建虚拟设备（推荐 Pixel 系列）
   - **使用真机**：连接手机，开启开发者选项和 USB 调试
3. 点击运行按钮（▶️）或按 `Shift + F10`
4. 应用会在模拟器/真机上启动

### 真机调试
在 Android 手机上开启 USB 调试：
1. 设置 → 关于手机 → 连续点击"版本号" 7 次（开启开发者模式）
2. 设置 → 系统 → 开发者选项 → 启用"USB 调试"
3. 连接电脑后，手机会弹出授权提示，点击"允许"

### Android 调试工具
**Chrome DevTools**（查看 JavaScript 控制台、DOM、网络）：
1. 在 Chrome 浏览器中打开：`chrome://inspect`
2. 确保手机已连接并运行应用
3. 在页面中找到你的应用，点击 "inspect"
4. 就像在浏览器中调试一样！

**Logcat**（查看原生日志）：
- Android Studio 底部的 "Logcat" 面板
- 可以过滤日志，搜索 "Capacitor" 或 "chromium" 查看 WebView 日志

## 🔥 实时调试和热更新

### 方案：Live Reload（开发时使用）

这个功能让你在修改代码后，原生应用自动刷新，无需重新构建！

#### 配置步骤

1. **获取你的本地 IP 地址**：
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   找到类似 `192.168.x.x` 的地址

2. **修改 `capacitor.config.ts`**：
   ```typescript
   import type { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.example.learnnote',
     appName: 'Learn Note',
     webDir: 'dist',
     // 开发时添加这个配置
     server: {
       url: 'http://192.168.x.x:3001',  // 替换成你的 IP
       cleartext: true
     }
   };

   export default config;
   ```

3. **启动开发服务器**：
   ```bash
   pnpm dev
   ```

4. **同步到原生项目**：
   ```bash
   pnpm run cap:sync
   ```

5. **在原生 IDE 中运行应用**

现在修改代码后，应用会自动刷新！✨

⚠️ **注意**：
- 确保手机和电脑在同一个 WiFi 网络
- 发布应用前记得删除 `server` 配置！

## 🔌 添加原生功能

Capacitor 提供了很多插件来访问原生功能。

### 常用插件
```bash
# 相机
pnpm add @capacitor/camera

# 文件系统
pnpm add @capacitor/filesystem

# 地理定位
pnpm add @capacitor/geolocation

# 状态栏
pnpm add @capacitor/status-bar

# 启动画面
pnpm add @capacitor/splash-screen

# 设备信息
pnpm add @capacitor/device
```

### 使用示例

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

// 拍照
const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  
  console.log('Image URI:', image.webPath);
};
```

**重要**：添加插件后记得运行 `pnpm run cap:sync`！

### 配置权限

某些功能需要在原生项目中配置权限：

**iOS** (`ios/App/App/Info.plist`)：
```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机来拍照</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册来选择图片</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`)：
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 🐛 常见问题排查

### 白屏问题
- **检查**：`capacitor.config.ts` 中的 `webDir: 'dist'` 配置是否正确
- **检查**：`vite.config.ts` 中的 `base: './'` 配置是否存在
- **解决**：重新构建并同步 `pnpm build && pnpm run cap:sync`

### 资源加载 404
- **原因**：路径配置不正确
- **检查**：确保 `vite.config.ts` 中 `base: './'`
- **检查**：确保 `dist/` 目录存在且有内容

### 插件不工作
- **解决**：确保运行了 `pnpm run cap:sync`
- **检查**：在原生 IDE 中查看是否有编译错误
- **检查**：权限是否配置正确

### iOS 无法运行
- **检查**：Xcode 中是否选择了正确的 Team（签名）
- **解决**：Product → Clean Build Folder，然后重新运行

### Android Gradle 同步失败
- **解决**：确保网络正常（可能需要科学上网）
- **解决**：在 Android Studio 中：File → Invalidate Caches → Invalidate and Restart

### 控制台找不到日志
- **iOS**：确保 Safari 中开启了 Web Inspector
- **Android**：确保在 `chrome://inspect` 中能看到你的设备

## 📦 构建发布版本

### iOS 发布
1. 在 Xcode 中：Product → Archive
2. 上传到 App Store Connect
3. 需要 Apple Developer 付费账号（¥688/年）

### Android 发布
1. 生成签名密钥
2. 在 Android Studio 中：Build → Generate Signed Bundle / APK
3. 上传到 Google Play Console
4. 需要 Google Play 开发者账号（$25 一次性）

## 📚 更多资源

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Capacitor 插件列表](https://capacitorjs.com/docs/plugins)
- [Ionic Framework](https://ionicframework.com/)（UI 组件库，可选）
- [Capacitor 社区插件](https://github.com/capacitor-community)

## 🆘 获取帮助

- [Capacitor GitHub Issues](https://github.com/ionic-team/capacitor/issues)
- [Capacitor Discord 社区](https://discord.com/invite/UPYYRhtyzp)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)

---

祝你开发愉快！🚀
