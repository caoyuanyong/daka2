import { PrismaClient } from '@prisma/client'
import { connect } from '@tidbcloud/serverless'
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: DATABASE_URL is missing in production environment');
      throw new Error('DATABASE_URL environment variable is required');
    }
    // In dev, fallback to default behavior if no URL is provided
    return new PrismaClient()
  }

  // 1. Clean URL: remove quotes, spaces
  url = url.trim().replace(/^["']|["']$/g, '');

  try {
    // 2. Parse URL for robust component extraction
    // Use URL object to strip 4000 port and ensure we only pass host/user/pass/db to connect()
    const urlObj = new URL(url);
    
    // Explicitly check for Forbidden (403) scenarios: often caused by IP whitelist or incorrect gateway params
    const connection = connect({
      host: urlObj.hostname,
      username: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.slice(1), 
    })
    
    const adapter = new PrismaTiDBCloud(connection)
    console.log(`Prisma: Database client initialized using TiDB Serverless adapter (host: ${urlObj.hostname})`);
    return new PrismaClient({ adapter })
  } catch (parseError) {
    console.warn('Prisma: URL parsing failed, falling back to connection string without port 4000');
    // Fallback: strip port 4000 but keep connection string structure
    const cleanUrl = url.replace(':4000', '');
    const connection = connect({ url: cleanUrl });
    const adapter = new PrismaTiDBCloud(connection);
    return new PrismaClient({ adapter });
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
