---
# ============================================================================
# 站点总配置 —— 改这一个文件就能控制全站
# ============================================================================
#
# 这个文件被 `npm run vault:pull` 一并 clone 下来,build 时由
# scripts/build-config.mjs 解析为 src/config/site-config.ts。
#
# === 编辑方式 (Obsidian 友好) ===
#
# 1. 上面 YAML frontmatter 的每个字段都拍平了(用 "dotted.key" 字面量键),
#    Obsidian 的 **Properties 面板** 会把每个显示成一行,直接点击就能编辑。
#    大部分基础配置都在这里。
#
# 2. 下面 markdown body 里有几个 ```yaml 代码块,放的是复杂配置
#    (导航菜单 / 页脚 / Pillar 顺序 / Resources 资源页)。
#    这些结构 Obsidian Properties 面板渲染不了,
#    按 Ctrl+E (Mac: Cmd+E) 切到 **Source mode**,点击代码块就能编辑。
#    Source mode 提供 YAML 语法高亮 + 自动缩进,所见即所得。
#
# 3. 改完 commit + push 你的 vault,build 时会自动拉最新配置。
# ============================================================================

# ---- 站点基础信息 ----
"site.name": "Obsidian Blog"
"site.shortName": "Obsidian Blog"
"site.tagline": "写一次，在两个地方读"
"site.description": "把 Obsidian Vault 直接渲染成静态博客,支持 wiki-link、callout、自动封面、力导向关系图、Pillar/Cluster 主题架构与 AdSense 合规。"
"site.defaultTheme": "light"
"site.themes": "light, dark, sepia, cyberpunk"
"site.locale": "zh_CN"
"site.defaultLanguage": "zh"
"site.languages": "zh, en"
# 正文主题: default(简洁) | academic | cyberpunk | receipt | sunset | aurora | bauhaus | knowledge | luxury | morandi | brutalism | github | terminal | magazine
"site.contentTheme": "default"

# ---- 作者 / 社交 ----
"site.author.name": "Omlandc"
"site.author.url": "https://github.com/Omlandc"
"site.social.github": "https://github.com/Omlandc"

# ---- SEO ----
"seo.siteUrl": "https://obsidian-blog-webapp.example.com"
"seo.ogImage": "/og-image.svg"
"seo.twitter": ""
"seo.keywords": "Obsidian, blog, wiki-link, callout, 知识管理, Pillar, Cluster"

# ---- AdSense ----
"ads.enabled": "false"
"ads.publisherId": "ca-pub-0000000000000000"
"ads.verification": "true"
"ads.autoAds": "true"
"ads.consent.required": "true"
"ads.consent.categories": "necessary, marketing"

# ---- Vault 仓库信息 (build 脚本读) ----
"vault.repo": "Omlandc/obsidian-test-article"
"vault.branch": "main"
"vault.publicAttachmentsPath": "/attachments"
---

# 📝 站点总配置

> 这个文件控制你的整个博客。**只改这一个文件** 就能调节站点名称、主题、SEO、广告、导航、页脚、主题簇、资源页 —— 不需要去翻 `src/` 目录。

## ✏️ 怎么编辑

| 想改的东西 | 在哪儿编辑 |
|---|---|
| 站点名 / 主题 / SEO / AdSense / Vault | 上方 YAML frontmatter (Properties 面板) |
| 导航菜单 / 页脚 / Pillar 顺序 | 下方 "导航 / 页脚 / Pillar" 代码块 |
| Resources 资源页内容 | 下方 "Resources 资源页" 代码块 |

**Obsidian Properties 面板**:打开文件时顶部会自动显示,每一行点击就能改。
**代码块**:按 `Ctrl+E` (Mac: `Cmd+E`) 切到 **Source mode**,点击代码块即可编辑 —— 有 YAML 语法高亮 + 自动缩进。

---

## 导航菜单 / 页脚 / Pillar 顺序

```yaml
nav:
  # 顶部导航的每一项,按出现顺序排列。
  # icon 可选值: Home | BookOpen | FileText | Layers | FolderTree | Tags | Tag | Network | BookOpen
  - { label: "首页", to: "/", icon: "Home" }
  - { label: "文章", to: "/blog", icon: "FileText" }
  - { label: "主题", to: "/topics", icon: "FolderTree" }
  - { label: "标签", to: "/tags", icon: "Tag" }
  - { label: "关系图", to: "/graph", icon: "Network" }
  - { label: "资源", to: "/resources", icon: "BookOpen" }

footer:
  copyright: "© Omlandc · Obsidian-compatible blog"
  links:
    # 页脚链接 —— 留空数组 [] 就不显示
    - { label: "关于", to: "/about" }
    - { label: "隐私", to: "/privacy" }
    - { label: "联系", to: "/contact" }

pillars:
  # Pillar 顺序。留空 [] 就从 vault 目录结构自动发现。
  # 填了之后按这里写的顺序显示,没填的 pillar 排在后面。
  - { name: "中医", description: "中医养生、经典与临床实践" }
  - { name: "其他", description: "其他主题笔记" }
```

---

## Resources 资源页 (`/resources`)

```yaml
resources:
  sections:
    # 按分组显示在 /resources 页面。每组下面的 items 是卡片。
    - title: "工具"
      description: "写这个博客用到的工具与库"
      items:
        - { title: "Obsidian", url: "https://obsidian.md", description: "知识管理的 Markdown 编辑器" }
        - { title: "D3.js", url: "https://d3js.org", description: "关系图所用的力导向图库" }
        - { title: "React", url: "https://react.dev", description: "UI 框架" }
    - title: "参考"
      description: "设计 / 实现参考"
      items:
        - { title: "blog-system", url: "https://github.com/Omlandc/blog-system", description: "同作者的早期博客系统" }
        - { title: "seo-kit", url: "https://github.com/Omlandc/seo-kit", description: "本仓库配套的 SEO 工具包" }
        - { title: "ai-dev-framework", url: "https://github.com/Omlandc/ai-dev-framework", description: "webapp-building 模板仓库" }
```

---

## 字段一览

### 上方 frontmatter (Properties 面板里直接编辑)

| 字段 | 控制什么 |
|---|---|
| `site.name` | 站点完整名(SEO / OG 用) |
| `site.shortName` | header 里显示的简称 |
| `site.tagline` | 一句话标语(SEO 首页 title 用) |
| `site.description` | 站点描述(SEO meta description 用) |
| `site.defaultTheme` | 默认主题:`light` / `dark` / `sepia` / `cyberpunk` |
| `site.themes` | 可用主题列表,逗号分隔 |
| `site.locale` | 站点语言(`zh_CN` / `en_US`) |
| `site.defaultLanguage` | 默认语言(`zh` / `en`),浏览器没偏好时用这个 |
| `site.languages` | 支持的语言列表,逗号分隔 |
| `site.author.name` | 作者名(SEO article:author 用) |
| `site.author.url` | 作者主页 |
| `site.social.github` | GitHub 链接(页脚会渲染) |
| `seo.siteUrl` | 站点完整 URL,canonical / sitemap 用 |
| `seo.ogImage` | OG image 路径 |
| `seo.twitter` | Twitter handle(不带 @) |
| `seo.keywords` | 站点级 keywords,逗号分隔 |
| `ads.enabled` | AdSense 总开关 `true` / `false` |
| `ads.publisherId` | Google AdSense 发布商 ID |
| `ads.verification` | 是否写入 `<meta name="google-adsense-account">` |
| `ads.autoAds` | 是否启用 Auto Ads |
| `ads.consent.required` | 是否需要 cookie consent banner (GDPR) |
| `ads.consent.categories` | cookie categories,逗号分隔 |
| `vault.repo` | Vault git 仓库 (`org/name`) |
| `vault.branch` | Vault 分支 |
| `vault.publicAttachmentsPath` | 附件公开 URL 前缀 |

### 下方代码块 (Source mode 编辑)

| 段落 | 控制什么 |
|---|---|
| `nav` | 顶部导航菜单,按数组顺序显示 |
| `footer` | 页脚版权 + 链接 |
| `pillars` | Pillar 显示顺序(留空自动从 vault 目录发现) |
| `resources` | `/resources` 页面的分组与条目 |
