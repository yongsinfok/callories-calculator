# 产品需求文档 (PRD)
## 热量追踪器 PWA - AI 驱动的智能热量追踪应用

**版本**: 1.0
**状态**: MVP 设计阶段
**创建日期**: 2026-01-07
**产品经理**: [待填写]
**工程负责人**: [待填写]

---

## 1. 执行摘要

### 1.1 产品愿景
打造一个极简但功能强大的热量追踪 PWA，通过 AI 拍照识别技术，让记录饮食变得毫不费力，帮助减脂人群和健康意识用户轻松达成健康目标。

### 1.2 核心价值主张
- **毫不费力的记录**: AI 拍照识别，无需手动搜索和输入
- **科学个性化**: 基于 Mifflin-St Jeor 公式自动计算个人热量目标
- **极简专注**: 清晰的今日进度视图，避免数据过载
- **随时可用**: PWA 支持，可离线使用，跨设备同步

### 1.3 目标用户
- **主要用户**: 减脂人群 (60%) - 需要创造热量缺口来减重
- **次要用户**: 健康意识用户 (40%) - 想了解日常饮食，养成健康习惯

### 1.4 成功指标 (North Star Metric)
**核心指标**: 周活跃用户 (WAU) 的 **日均记录率**
- 目标: MVP 阶段达到 40% 的用户每天至少记录一餐
- 衡量方式: (至少记录一次的用户数 / 总活跃用户数)

**关键指标**:
- 7日留存率: 目标 ≥ 35%
- AI 识别准确率: 目标 ≥ 80% (用户无需修改即确认)
- 平均每次记录时长: 目标 ≤ 30 秒

---

## 2. 问题与机会

### 2.1 用户痛点
基于用户研究和市场分析：

1. **记录负担重**
   - 现有应用需要手动搜索食物数据库
   - 输入份量复杂 (克数、杯数、单位转换)
   - 中餐食物数据库不完善

2. **数据过载**
   - 过多图表和指标让用户困惑
   - 功能复杂影响使用意愿

3. **缺乏个性化**
   - 通用热量目标不适应个体差异
   - 未考虑活动水平和减脂速度

4. **使用门槛高**
   - 需要下载 APP，占用存储空间
   - 跨设备数据不同步

### 2.2 市场机会
- 中国减脂市场规模持续增长，年轻用户对 AI 辅助健康管理接受度高
- PWA 技术成熟，可提供接近原生的体验
- GLM-4.6V 等多模态 AI 能力已可支持食物识别场景

### 2.3 竞品分析
| 产品 | 优势 | 劣势 | 我们的机会 |
|------|------|------|------------|
| MyFitnessPal | 数据库庞大 | 中餐数据少，界面复杂 | AI 识别 + 极简设计 |
| FatSecret | 社区活跃 | 手动输入繁琐 | 拍照记录效率 |
| 薄荷健康 | 本土化好 | 功能臃肿 | 聚焦核心价值 |

---

## 3. 解决方案

### 3.1 产品定位
**一句话描述**: 一个用 AI 拍照就能记录的热量追踪器

### 3.2 核心功能 (MVP)

#### 功能 1: 智能身体数据采集与 TDEE 计算
**用户故事**: 作为新用户，我希望能输入我的身体数据，让系统自动告诉我每天应该摄入多少热量。

**验收标准**:
- [ ] 用户可输入: 性别、年龄、身高(cm)、体重(kg)、活动水平
- [ ] 活动水平选项:
  - 久坐 (办公室工作，极少运动)
  - 轻度活动 (每周运动 1-3 天)
  - 中度活动 (每周运动 3-5 天)
  - 高度活动 (每周运动 6-7 天)
  - 非常活跃 (体力劳动或每日高强度训练)
- [ ] 系统使用 Mifflin-St Jeor 公式计算 BMR
- [ ] 根据活动系数计算 TDEE
- [ ] 为减脂用户自动设置 -500 大卡缺口
- [ ] 显示计算结果: BMR、TDEE、每日目标热量

#### 功能 2: AI 拍照识别食物
**用户故事**: 作为用户，我希望能拍照记录我的食物，让 AI 自动识别并估算热量，节省我的时间。

**验收标准**:
- [ ] 支持相机实时拍照
- [ ] 支持从相册上传图片
- [ ] 调用 GLM-4.6V API 进行食物识别
- [ ] 返回结构化数据:
  - 食物名称
  - 估算重量 (克)
  - 热量 (大卡)
  - 蛋白质 (克)
  - 碳水化合物 (克)
  - 脂肪 (克)
- [ ] 识别时间 ≤ 5 秒
- [ ] 支持多食物图片识别 (如餐盘中的多种食物)

#### 功能 3: 食物确认与保存
**用户故事**: 作为用户，我希望能确认 AI 的识别结果，必要时进行微调，然后保存到我的记录中。

**验收标准**:
- [ ] 显示 AI 识别结果卡片
- [ ] 用户可编辑: 食物名称、重量、热量、营养素
- [ ] 用户可选择餐型: 早餐、午餐、晚餐、加餐
- [ ] 确认后保存到 Supabase 数据库
- [ ] 保存后自动返回今日进度页面
- [ ] 识别结果自动加入用户个人食物库

#### 功能 4: 今日热量进度视图
**用户故事**: 作为用户，我希望能一眼看到我今天还能吃多少热量，以及已经吃了什么。

**验收标准**:
- [ ] 大型圆形进度条或渐变进度条
- [ ] 显示:
  - 已摄入热量 / 目标热量
  - 剩余可用热量 (大字高亮)
  - 今日已记录食物列表 (按时间倒序)
- [ ] 每条食物记录显示: 时间、食物名、热量
- [ ] 支持点击记录查看详情
- [ ] 支持删除记录

#### 功能 5: 用户认证与数据同步
**用户故事**: 作为用户，我希望我的数据能安全地保存在云端，换设备也能继续使用。

**验收标准**:
- [ ] 邮箱密码注册/登录
- [ ] 使用 Supabase Auth
- [ ] 数据实时同步到云端
- [ ] 支持多设备登录
- [ ] Row Level Security (RLS) 确保数据隔离

### 3.3 UI/UX 设计方向

#### 美学风格
**主题**: 有机自然 + 清新活力

**色彩方案**:
```
主色: 暖橙渐变
  - #FF6B35 (深度橙)
  - #FF8E53 (浅橙)

辅色: 鼠尾草绿
  - #7CB342

背景色:
  - #FAF8F5 (奶油白)
  - #FFFFFF (纯白)

文字色:
  - #2D3436 (深炭灰 - 主文字)
  - #636E72 (中灰 - 次要文字)
  - #B2BEC3 (浅灰 - 占位符)

功能色:
  - 成功: #00B894
  - 警告: #FDCB6E
  - 错误: #D63031
```

**字体**:
- 标题: **Outfit** 或 **Space Grotesk** (几何感、现代)
- 正文: **Plus Jakarta Sans** (人文、温暖、可读性高)

#### 核心页面
1. **Dashboard (首页)**: 圆形进度条 + 剩余热量 + 食物列表
2. **Camera (拍照页)**: 大取景框 + 拍照按钮 + 相册入口
3. **Confirm (确认页)**: AI 结果卡片 + 编辑表单 + 确认按钮
4. **Profile (我的)**: 身体数据 + 目标设置 + 登出

#### 微交互
- 添加食物时的涟漪动画
- 进度条达到目标时的庆祝粒子效果
- 页面切换的流畅过渡 (framer-motion)
- 按钮点击的触觉反馈

---

## 4. 技术架构

### 4.1 技术栈

**前端**:
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- Framer Motion 11 (动画)
- TypeScript

**后端**:
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes (GLM-4.6V 代理)

**AI 服务**:
- GLM-4.6V (智谱 AI 多模态模型)

**PWA**:
- next-pwa
- Service Worker (离线支持)
- Web App Manifest

**未来扩展**:
- Capacitor (打包为 iOS/Android 原生应用)

### 4.2 数据库设计

#### 表结构

**profiles** (用户基本信息)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  height_cm INTEGER NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('lose_weight', 'maintain', 'gain_muscle')),
  daily_calorie_target INTEGER NOT NULL,
  bmr INTEGER,
  tdee INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

**food_entries** (食物记录)
```sql
CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url TEXT,
  estimated_weight_g NUMERIC(6,2),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, entry_date DESC);

-- RLS 策略
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON food_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON food_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON food_entries FOR DELETE USING (auth.uid() = user_id);
```

**user_food_library** (用户个人食物库)
```sql
CREATE TABLE user_food_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories_per_100g INTEGER NOT NULL,
  protein_g_per_100g NUMERIC(6,2),
  carbs_g_per_100g NUMERIC(6,2),
  fat_g_per_100g NUMERIC(6,2),
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_name)
);

-- RLS 策略
ALTER TABLE user_food_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own library" ON user_food_library FOR ALL USING (auth.uid() = user_id);
```

### 4.3 GLM-4.6V 集成

**API 调用流程**:
```
用户拍照
  → 图片转为 base64
  → POST /api/recognize-food
  → 调用 GLM-4.6V API
  → 返回结构化 JSON
  → 用户确认
  → 保存到 Supabase
```

**Prompt 设计**:
```
你是一个专业的营养分析助手。请分析这张图片中的食物，返回 JSON 格式。

要求:
1. 识别所有可见的食物
2. 估算每种食物的重量（克）
3. 计算热量和营养成分
4. 如果是多食物，返回数组

返回格式（严格遵守）:
{
  "foods": [
    {
      "food_name": "食物名称",
      "estimated_weight_g": 估算重量,
      "calories": 热量(大卡),
      "protein_g": 蛋白质(克),
      "carbs_g": 碳水化合物(克),
      "fat_g": 脂肪(克)
    }
  ],
  "total_calories": 总热量,
  "confidence": "high" | "medium" | "low"
}

如果图片模糊或无法识别，返回:
{
  "error": "无法识别，请重新拍照",
  "suggestion": "建议: 靠近一些，确保光线充足"
}
```

**成本优化策略**:
1. 识别结果保存到 `user_food_library`
2. 重复食物直接从数据库匹配
3. 预填充 100+ 常见中餐基础数据

### 4.4 PWA 配置

**manifest.json**:
```json
{
  "name": "热量追踪器",
  "short_name": "热量追踪",
  "description": "AI 驱动的智能热量追踪应用",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#FAF8F5",
  "theme_color": "#FF6B35",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["health", "fitness", "lifestyle"],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "540x720", "type": "image/png" }
  ]
}
```

---

## 5. 项目范围

### 5.1 MVP 范围 (第一阶段)

**包含**:
- ✅ 用户注册/登录 (邮箱密码)
- ✅ 身体数据采集 + TDEE 自动计算
- ✅ AI 拍照识别食物
- ✅ 食物确认与保存
- ✅ 今日热量进度视图
- ✅ 基础数据同步

### 5.2 Out of Scope (MVP 阶段不包含)

**明确排除**:
- ❌ 运动消耗追踪 (留到 v2)
- ❌ 体重记录与趋势图 (留到 v2)
- ❌ 营养素详细分析 (留到 v2)
- ❌ 社交分享功能
- ❌ 饮食计划推荐
- ❌ 条形码扫描
- ❌ 餐厅数据库
- ❌ Apple Health / Google Fit 集成
- ❌ 推送通知
- ❌ iOS/Android 原生应用
- ❌ 多语言支持 (仅中文)
- ❌ 付费订阅 (完全免费)

### 5.3 未来版本规划

**v1.5 (MVP 后 3 个月)**:
- 体重记录与趋势图
- 周/月历史数据查看
- 营养素分析 (蛋白质/碳水/脂肪占比)
- 目标调整功能

**v2.0 (6 个月后)**:
- 运动消耗追踪
- Apple Health / Google Fit 集成
- 条形码扫描
- 餐厅数据库
- 推送提醒

**v3.0 (12 个月后)**:
- Capacitor 打包为原生 iOS/Android 应用
- AI 饮食建议
- 社交功能
- 付费高级版

---

## 6. 非功能性需求

### 6.1 性能要求
- AI 识别响应时间: ≤ 5 秒 (P95)
- 页面首屏加载: ≤ 2 秒 (4G 网络)
- 离线模式: 支持离线查看数据，联网后自动同步
- 图片上传: 压缩至 ≤ 500KB

### 6.2 安全要求
- 所有 API 请求通过 HTTPS
- 用户数据使用 RLS 隔离
- 密码使用 Supabase Auth 加密存储
- API Key 不暴露到客户端 (通过 Next.js API Routes 代理)
- 图片存储在 Supabase Storage，设置访问策略

### 6.3 兼容性要求
**浏览器支持**:
- Chrome/Edge: 最新 2 个版本
- Safari: 最新 2 个版本
- Firefox: 最新 2 个版本
- Samsung Internet: 最新版本

**设备支持**:
- iOS 14+
- Android 10+
- 桌面端 (响应式设计)

### 6.4 可访问性
- 遵循 WCAG 2.1 AA 标准
- 支持屏幕阅读器
- 键盘导航友好
- 足够的颜色对比度
- 字体大小可调整

---

## 7. 数据分析计划

### 7.1 关键指标定义

**用户参与度**:
- DAU / MAU 比率 (粘性)
- 平均每日记录次数
- 平均会话时长
- 7/30 日留存率

**功能使用**:
- AI 识别使用率 vs 手动编辑率
- AI 识别准确率 (用户修改率)
- 餐型分布 (早/午/晚/加餐)

**技术指标**:
- API 调用次数和成本
- 错误率
- PWA 安装率
- 离线使用率

### 7.2 追踪工具
- **Supabase Analytics**: 数据库查询分析
- **Vercel Analytics** (如果部署): 前端性能和用户行为
- **自定义事件**: 在关键操作点埋点

**关键事件**:
```javascript
// 事件追踪示例
analytics.track('food_recorded', {
  method: 'ai_recognition', // or 'manual_edit'
  meal_type: 'lunch',
  calories: 500,
  ai_confidence: 'high'
});

analytics.track('onboarding_completed', {
  age: 25,
  goal_calories: 1800
});
```

---

## 8. 发布计划

### 8.1 开发里程碑

**Phase 1: 基础搭建 (2 周)**
- [ ] 初始化 Next.js + Supabase 项目
- [ ] 配置 Tailwind + 自定义主题
- [ ] 创建 Supabase 表结构
- [ ] 实现认证流程
- [ ] 创建基础布局和导航

**Phase 2: 核心功能 (3 周)**
- [ ] 身体数据采集页面
- [ ] TDEE 计算逻辑
- [ ] 拍照/上传图片功能
- [ ] GLM-4.6V API 集成
- [ ] 食物确认页面

**Phase 3: 仪表盘 (2 周)**
- [ ] 今日进度视图
- [ ] 食物记录列表
- [ ] 实时数据更新

**Phase 4: PWA 打磨 (1 周)**
- [ ] 配置 PWA manifest
- [ ] 实现 Service Worker
- [ ] 添加离线支持
- [ ] 设计图标和启动画面

**Phase 5: 测试与修复 (1 周)**
- [ ] 功能测试
- [ ] 兼容性测试
- [ ] 性能优化
- [ ] Bug 修复

**总计**: 约 9 周

### 8.2 测试计划

**Alpha 测试 (内部)**:
- 参与者: 团队成员 + 亲友
- 人数: 10-15 人
- 时长: 2 周
- 反馈渠道: 问卷 + 一对一访谈

**Beta 测试 (公开)**:
- 参与者: 社区用户
- 人数: 50-100 人
- 时长: 2 周
- 反馈渠道: 应用内反馈 + GitHub Issues

### 8.3 发布策略

**软发布**:
- 渠道: Product Hunt + 少数社区
- 目标: 获取 100 个初始用户
- 收集反馈并快速迭代

**正式发布**:
- 渠道: 微信群、小红书、知乎
- 目标: 1000 个注册用户
- 内容: 使用教程 + 用户故事

---

## 9. 风险与依赖

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| GLM-4.6V API 限流或价格上涨 | 高 | 实施用户食物库缓存，预填充常见食物数据 |
| AI 识别准确率不达标 | 中 | 允许用户手动编辑，持续优化 prompt |
| PWA 兼容性问题 | 中 | 充分测试，提供降级方案 |
| Supabase 免费额度限制 | 低 | 监控用量，设置使用警告 |

### 9.2 产品风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 用户不愿频繁拍照记录 | 高 | 提供快速记录方式，强调长期价值 |
| 中餐食物识别准确率低 | 高 | 收集用户数据，针对性优化 |
| 用户留存率低 | 中 | 添加里程碑提醒，展示进度激励 |

### 9.3 外部依赖

**关键依赖**:
- Supabase 服务稳定性
- GLM-4.6V API 可用性和成本
- Next.js 框架更新

**备份方案**:
- Supabase: 备份策略，考虑迁移到自托管 PostgreSQL
- AI: 备选模型 (如 OpenAI GPT-4V, Claude 3.5 Sonnet)

---

## 10. 成功标准

### 10.1 MVP 成功定义

**最低可行标准** (产品可用):
- [ ] 用户可以完成完整流程: 注册 → 设置 → 拍照记录 → 查看进度
- [ ] AI 识别准确率 ≥ 70%
- [ ] 应用崩溃率 < 2%
- [ ] 至少 50 个用户完成 onboarding

**理想标准** (产品成功):
- [ ] 7 日留存率 ≥ 35%
- [ ] 日均记录率 ≥ 40%
- [ ] NPS (净推荐值) ≥ 30
- [ ] 至少 500 个注册用户

### 10.2 验收检查清单

**功能验收**:
- [ ] 所有 MVP 功能正常工作
- [ ] 无 critical 级别 bug
- [ ] 通过安全审计
- [ ] 兼容目标浏览器和设备

**性能验收**:
- [ ] Lighthouse 性能分数 ≥ 80
- [ ] AI 识别 P95 ≤ 5 秒
- [ ] 首屏加载 ≤ 2 秒

**体验验收**:
- [ ] 通过 5 个用户测试
- [ ] 用户满意度 ≥ 4/5
- [ ] 完成一次记录 ≤ 30 秒

---

## 11. 附录

### 11.1 术语表

- **TDEE**: Total Daily Energy Expenditure (每日总能量消耗)
- **BMR**: Basal Metabolic Rate (基础代谢率)
- **PWA**: Progressive Web App (渐进式 Web 应用)
- **RLS**: Row Level Security (行级安全策略)
- **WAU**: Weekly Active Users (周活跃用户)
- **NPS**: Net Promoter Score (净推荐值)

### 11.2 参考资料

**算法**:
- Mifflin-St Jeor 公式: https://en.wikipedia.org/wiki/Basal_metabolic_rate
- 活动系数表: https://www.ncbi.nlm.nih.gov/pmc/articles/PMCPMC3704271/

**技术文档**:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- GLM-4.6V: https://docs.z.ai/api-reference/llm/chat-completion
- next-pwa: https://github.com/shadowwalker/next-pwa

**设计参考**:
- Google Material Design 3
- Apple Human Interface Guidelines
- Tailwind UI

### 11.3 变更记录

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-01-07 | [待填写] | 初始版本 |

---

## 12. 审批与签字

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 产品经理 | | | |
| 工程负责人 | | | |
| 设计负责人 | | | |
| 业务负责人 | | | |

---

**文档结束**

如有疑问或需要进一步讨论，请联系产品经理。
