// Environment configuration
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.nfvctrdnjdofpncxefhl:fPXx0YSCsf8UIzkR@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
    host: process.env.DB_HOST || 'aws-1-us-east-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '6543'),
    username: process.env.DB_USERNAME || 'postgres.nfvctrdnjdofpncxefhl',
    password: process.env.DB_PASSWORD || 'fPXx0YSCsf8UIzkR',
    database: process.env.DB_NAME || 'postgres',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Encryption
  encryption: {
    aesKey: process.env.AES_KEY || 'your-aes-key-32-chars-long',
    rsaPublicKey: process.env.RSA_PUBLIC_KEY,
    rsaPrivateKey: process.env.RSA_PRIVATE_KEY,
  }
};
