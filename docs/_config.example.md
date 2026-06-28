---
# =====================================================================
# 站点总配置 —— 改这一个文件即可控制全站
# 此文件会被 `npm run vault:pull` 一并 clone 下来，build 时由
# scripts/build-config.mjs 解析为 src/config/site-config.ts。
# =====================================================================

# ---------------------------------------------------------------------------
# 1) site —— 基础站点信息（站点名、标语、默认主题、可用主题、社交链接）
# ---------------------------------------------------------------------------
site:
  name: Obsidian Blog
  shortName: Obsidian Blog
  tagline: 写一次，在两个地方读
  description: 把 Obsidian Vault 直接渲染成静态博客，支持 wiki-link、callout、自动封面、力导向关系图、Pillar/Cluster 主题架构与 AdSense 合规。
  # 默认主题（light / dark / sepia / cyberpunk）
  defaultTheme: light
  # 可用主题列表（主题切换器下拉）
  themes: [light, dark, sepia, cyberpunk]
  # 站点语言
  locale: zh_CN
  # 作者信息（用于 OG / SEO）
  author:
    name: Omlandc
    url: https://github.com/Omlandc
  # 社交链接（页脚会渲染；缺失则不渲染）
  social:
    github: https://github.com/Omlandc
    # twitter: https://twitter.com/...
    # email: you@example.com

# ---------------------------------------------------------------------------
# 2) seo —— SEO 默认值（每个页面可覆盖）
# ---------------------------------------------------------------------------
seo:
  # 不带协议头的根域名，sitemaps / canonicals 用
  siteUrl: https://obsidian-blog-webapp.example.com
  # OG image，build 时复制到 public/og-image.svg
  ogImage: /og-image.svg
  # 站点级 keywords
  keywords:
    - Obsidian
    - blog
    - wiki-link
    - callout
    - 知识管理
    - Pillar
    - Cluster
  # Twitter handle（不带 @）
  twitter: ""

# ---------------------------------------------------------------------------
# 3) ads —— AdSense 配置（GDPR 合规）
# ---------------------------------------------------------------------------
ads:
  enabled: false            # 是否启用 AdSense（true 后才注入 Auto Ads 脚本）
  publisherId: ca-pub-0000000000000000
  verification: true        # 写入 <meta name="google-adsense-account">
  autoAds: true             # Auto Ads (AdSense 自己决定广告位)
  consent:
    required: true          # 是否需要 cookie consent banner（GDPR / CCPA）
    categories: [necessary, marketing]

# ---------------------------------------------------------------------------
# 4) vault —— Vault 仓库信息（构建脚本读）
# ---------------------------------------------------------------------------
vault:
  repo: Omlandc/obsidian-test-article
  branch: main
  # ref: ""  # 锁定到某个 commit 可复现构建（可选）
  # publicAttachmentsPath 在浏览器端暴露给 remark-wikilink 用，
  # 必须与 build-config / copy-attachments 一致。
  publicAttachmentsPath: /attachments

# ---------------------------------------------------------------------------
# 5) nav —— 顶部导航
# ---------------------------------------------------------------------------
nav:
  - label: 首页
    to: /
    icon: Home
  - label: 文章
    to: /blog
    icon: FileText
  - label: 主题
    to: /topics
    icon: FolderTree
  - label: 标签
    to: /tags
    icon: Tag
  - label: 关系图
    to: /graph
    icon: Network
  - label: 资源
    to: /resources
    icon: BookOpen

# ---------------------------------------------------------------------------
# 6) footer —— 页脚链接 + 版权
# ---------------------------------------------------------------------------
footer:
  copyright: © Omlandc · Obsidian-compatible blog
  links:
    - label: 关于
      to: /about
    - label: 隐私
      to: /privacy
    - label: 联系
      to: /contact

# ---------------------------------------------------------------------------
# 7) pillars —— 主题簇列表（控制 /topics 页顺序与可选描述）
# 不填则根据 vault 目录结构自动发现；填了之后用填的顺序。
# ---------------------------------------------------------------------------
pillars:
  - name: 中医
    description: 中医养生、经典与临床实践
  - name: 其他
    description: 其他主题笔记

# ---------------------------------------------------------------------------
# 8) resources —— /resources 页面内容
# ---------------------------------------------------------------------------
resources:
  sections:
    - title: 工具
      description: 写这个博客用到的工具与库
      items:
        - title: Obsidian
          url: https://obsidian.md
          description: 知识管理的 Markdown 编辑器
        - title: D3.js
          url: https://d3js.org
          description: 关系图所用的力导向图库
        - title: React
          url: https://react.dev
          description: UI 框架
    - title: 参考
      description: 设计 / 实现参考
      items:
        - title: blog-system
          url: https://github.com/Omlandc/blog-system
          description: 同作者的早期博客系统
        - title: seo-kit
          url: https://github.com/Omlandc/seo-kit
          description: 本仓库配套的 SEO 工具包
        - title: ai-dev-framework
          url: https://github.com/Omlandc/ai-dev-framework
          description: webapp-building 模板仓库
---

# 📝 站点总配置

> 这个文件控制你的整个博客。**只改这一个文件**就能调节站点名称、主题、SEO、广告、导航、页脚、主题簇、资源页 ——
> 不需要去翻 `src/` 目录。

## 怎么编辑

1. 用 Obsidian 打开你的 vault 根目录
2. 找到 `_config.md`（这个文件）
3. 改顶部的 YAML frontmatter（`---` 之间）
4. 提交并 push 你的 vault，CI / 本地 `npm run build` 会自动拉取最新配置

## 字段一览

| 段落 | 控制什么 |
|------|---------|
| `site` | 站点名称、标语、默认主题、可用主题列表、社交链接 |
| `seo` | 站点 URL、OG image、keywords、Twitter handle |
| `ads` | AdSense 发布商 ID、自动广告开关、cookie consent |
| `vault` | vault 仓库 URL / 分支（构建用） |
| `nav` | 顶部导航菜单的项、图标、顺序 |
| `footer` | 页脚链接与版权 |
| `pillars` | 主题簇的手动顺序（不填则自动从目录发现） |
| `resources` | `/resources` 页面的分组与条目 |

下面这些 Markdown 文字只是给 Obsidian 里看的说明，**不会出现在站点上**。
