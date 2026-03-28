import { PrismaClient } from '@prisma/client'
import { connect } from '@tidbcloud/serverless'
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter'

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    let url = process.env.DATABASE_URL
    if (!url) {
      console.error('CRITICAL: DATABASE_URL is missing in production environment');
      throw new Error('DATABASE_URL environment variable is required');
    }

    // 彻底剥离可能存在的引号 (Cloudflare 环境变量常见问题) 和多余空格
    url = url.trim().replace(/^["']|["']$/g, '');

    try {
      // 提取核心连接组件，规避 URL 编码和端口号带来的 403 Forbidden 错误
      const urlObj = new URL(url);
      const connection = connect({
        host: urlObj.hostname,
        username: urlObj.username,
        password: urlObj.password,
        database: urlObj.pathname.slice(1), 
      })
      const adapter = new PrismaTiDBCloud(connection)
      return new PrismaClient({ adapter })
    } catch (parseError) {
      // 如果 URL 解析依然失败，回退到清洗后的字符串，但剔除 4000 端口
      const cleanUrl = url.replace(':4000', '');
      const connection = connect({ url: cleanUrl });
      const adapter = new PrismaTiDBCloud(connection);
      return new PrismaClient({ adapter });
    }
  }
  return new PrismaClient()
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
