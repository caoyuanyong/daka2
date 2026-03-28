import { PrismaClient } from '@prisma/client'
import { connect } from '@tidbcloud/serverless'
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL
  if (!url) return new PrismaClient()

  // 1. Clean URL: remove quotes, spaces
  url = url.trim().replace(/^["']|["']$/g, '');

  try {
    // 2. Parse URL for robust component extraction
    const urlObj = new URL(url);
    
    // Explicitly rebuild the URL string without the :4000 port and WITHOUT any query params (like sslaccept)
    // The TiDB Serverless HTTP gateway (via @tidbcloud/serverless) takes care of the transport.
    const cleanUrl = `mysql://${urlObj.username}:${urlObj.password}@${urlObj.hostname}${urlObj.pathname}`;
    
    console.log(`Prisma: Connecting to ${urlObj.hostname} using cleaner URL strategy (excluding port 4000 and query params)`);
    
    const connection = connect({ url: cleanUrl });
    const adapter = new PrismaTiDBCloud(connection);
    return new PrismaClient({ adapter });
    
  } catch (parseError) {
    console.warn('Prisma: URL parsing failed, falling back to manual string manipulation');
    // Manual fallback: strip :4000 and anything from '?' onwards
    const fallbackUrl = url.replace(':4000', '').split('?')[0];
    const connection = connect({ url: fallbackUrl });
    const adapter = new PrismaTiDBCloud(connection);
    return new PrismaClient({ adapter });
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
