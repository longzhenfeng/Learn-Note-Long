import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.learnnote',
  appName: 'Learn Note',
  webDir: 'dist',
  server: {
    cleartext: true,
    url: 'http://192.168.233.66:3001'
  }
};

export default config;
