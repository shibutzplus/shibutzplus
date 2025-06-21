export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/shibutzplus',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
