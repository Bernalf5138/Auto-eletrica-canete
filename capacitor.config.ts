import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autoeletricacanete.app',
  appName: 'Auto Electrica Canete',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
