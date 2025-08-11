// Environment detection utilities

export const isProduction = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side, check NODE_ENV
    return process.env.NODE_ENV === 'production';
  }
  
  // Client-side, check hostname
  const hostname = window.location.hostname;
  return !hostname.includes('localhost') && 
         !hostname.includes('127.0.0.1') && 
         !hostname.includes('0.0.0.0');
};

export const isDevelopment = (): boolean => {
  return !isProduction();
};

export const getEnvironmentInfo = () => {
  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    nodeEnv: process.env.NODE_ENV
  };
};
