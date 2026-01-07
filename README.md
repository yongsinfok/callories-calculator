# 热量追踪器 PWA

一个基于 AI 的智能热量追踪 PWA 应用，通过拍照识别食物，帮助用户轻松记录饮食。

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **动画**: Framer Motion 11
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: GLM-4.6V 多模态模型
- **PWA**: next-pwa

## 功能特性

- ✅ 用户认证系统 (邮箱密码登录)
- ✅ 身体数据采集 + TDEE 自动计算
- ✅ AI 拍照识别食物
- ✅ 食物确认与保存
- ✅ 今日热量进度视图
- ✅ PWA 支持 (可安装到主屏幕)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GLM-4.6V API 配置
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 3. 设置 Supabase 数据库

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 SQL Editor 中执行 `supabase/schema.sql` 中的 SQL 脚本

### 4. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   └── recognize-food/  # AI 食物识别 API
│   ├── auth/                # 认证页面
│   ├── onboarding/          # 引导流程
│   ├── dashboard/           # 仪表盘
│   ├── camera/              # 拍照页面
│   ├── confirm/             # 确认页面
│   ├── profile/             # 个人资料
│   └── layout.tsx           # 根布局
├── components/              # React 组件
│   └── providers/           # Context 提供者
├── lib/                     # 工具函数
│   ├── supabase.ts          # Supabase 客户端
│   └── calculations.ts      # TDEE 计算
├── supabase/                # Supabase 相关
│   └── schema.sql           # 数据库结构
└── public/                  # 静态资源
    └── manifest.json        # PWA manifest
```

## 算法说明

### TDEE 计算

应用使用 **Mifflin-St Jeor 公式** 计算基础代谢率 (BMR)：

**男性**:
```
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5
```

**女性**:
```
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161
```

然后根据活动水平计算 TDEE：
- 久坐: BMR × 1.2
- 轻度活动: BMR × 1.375
- 中度活动: BMR × 1.55
- 高度活动: BMR × 1.725
- 非常活跃: BMR × 1.9

## PWA 安装

1. 在浏览器中打开应用
2. 点击地址栏的 "安装" 图标
3. 确认安装到主屏幕

## 构建生产版本

```bash
npm run build
npm start
```

## 环境变量获取

### Supabase

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 Settings > API 中获取 URL 和 anon key

### GLM-4.6V API

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册账号
3. 在 API Keys 中创建密钥

## 数据库表结构

### profiles
用户基本信息，包括身体数据和热量目标

### food_entries
食物记录，包括每次吃的食物详情

### user_food_library
用户个人食物库，保存常吃食物的营养信息

## 许可证

MIT
