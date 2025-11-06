import { frontendLogger } from './logger';

// Environment configuration utility
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
  
  const envFile = isProduction ? '.env.production' : '.env.local';
  
  // Use logger instead of console.log
  frontendLogger.logEnvironment();
  
  return {
    isDevelopment,
    isProduction,
    isDebug,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
    environment: process.env.NEXT_PUBLIC_ENV,
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL
  };
};

export const config = getEnvironmentConfig();