import { PrismaClient } from '@prisma/client'
import { connect } from '@tidbcloud/serverless'
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter'

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    const url = process.env.DATABASE_URL
    if (!url) {
      console.error('CRITICAL: DATABASE_URL is missing in production environment');
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      // 提取核心连接组件，规避 URL 编码和端口号带来的 403 Forbidden 错误
      const urlObj = new URL(url);
      const connection = connect({
        host: urlObj.hostname,
        username: urlObj.username,
        password: urlObj.password,
        database: urlObj.pathname.slice(1), // 剔除开头的 /
      })
      const adapter = new PrismaTiDBCloud(connection)
      return new PrismaClient({ adapter })
    } catch (parseError) {
      console.error('DATABASE_URL 解析失败:', parseError.message);
      // 回退到简单处理（兼容不支持 URL 解析的环境）
      const connection = connect({ url: url.replace(':4000', '') });
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
