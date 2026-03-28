# 线上部署保姆级教程 (Next.js + Prisma + MySQL)

为了支持运营，建议将系统部署到 **Vercel**（前端）和 **TiDB Cloud**（数据库），这两者都有非常友好的免费额度，且性能优异。

## 第一步：准备数据库 (TiDB Cloud)

1. 访问 [TiDB Cloud](https://pingcap.com/tidb-cloud/) 并注册账号。
2. 创建一个 **Serverless Tier** 实例（永久免费）。
3. 在集群控制台点击 **Connect**，选择 **Prisma**。
4. 获取连接字符串，它看起来像这样：
   `mysql://[USER]:[PASSWORD]@[HOST]:4000/bj_db?sslaccept=strict`

## 第二步：准备代码仓库

1. 在 [GitHub](https://github.com/) 上创建一个私有仓库。
2. 将本地代码推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git remote add origin [你的仓库地址]
   git push -u origin main
   ```


## 第三步：部署到 Vercel

1. 登录 [Vercel](https://vercel.com/)，点击 **Add New > Project**。
2. 导入刚才创建的 GitHub 仓库。
3. 在 **Environment Variables** 段落，添加以下变量：
   - `DATABASE_URL`: (你在第一步获取的 TiDB 连接字符串)
   - `JWT_SECRET`: (输入一串随机字符，例如 `bj-family-secure-key-2026`)
4. 点击 **Deploy**。

## 第四步：推送数据库表结构

部署完成后，由于线上数据库是空的，你需要运行一次推送命令：
1. 在本地终端，将 `.env` 中的 `DATABASE_URL` 临时改为线上的地址。
2. 运行：
   ```bash
   npx prisma db push
   ```
3. 或者是通过 Vercel 的 **Settings > Integrations** 或者是手动在本地环境执行。

## 第五步：管理员后台 (运营核心)

部署完成后，您作为运营者可以通过管理后台管控整个系统：
1. **访问地址**: `https://daka2-lac.vercel.app/admin`
2. **默认凭据**:
   - **账号**: `admin`
   - **后台密钥**: `admin888`
3. **主要操作**:
   - **开卡**: 进入“会员卡密管理”，设置天数并点击“立即生成”，复制生成的 16 位卡密发给家长。
   - **开号**: 进入“家庭账号管理”，手动为家长创建登录账号。

## 第六步：权限拦截逻辑说明 (VIP Guard)

系统已内置权限防火墙，确保只有付费或激活用户可用：
- **未激活账号**: 登录后会自动拦截并强制跳转到 `/redeem` 页面，无法使用任何功能。
- **过期账号**: VIP 权重天数消耗完毕后，系统会自动恢复拦截状态。
- **激活流程**: 用户在 `/redeem` 界面输入您在后台给他的 16 位卡密即可瞬间解锁全站功能。

## 第七步：验证线上环境

1. 访问您的 Vercel 域名。
2. 使用注册功能创建一个新账号。
3. 您会发现被强制留在了“兑换”页面（权限拦截生效）。
4. 在 /admin 页面生成一个 7 天卡密，回前台兑换。
5. 验证是否能成功解锁进入首页。

---
> [!TIP]
> **生产环境注意**:
> - **安全性**: 上线后建议修改 `src/app/admin/page.js` 中的硬编码管理员密码。
> - **数据库备份**: TiDB Cloud 支持自动备份。
> - **环境要求**: 请确保 Vercel 构建使用的 Node.js 版本在 18 以上（以支持 BigInt 序列化）。
