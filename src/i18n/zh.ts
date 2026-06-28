/**
 * Chinese (Simplified) translations.
 *
 * Keys are dot-namespaced: `nav.posts`, `home.hero.title`, etc.
 * Add a key here and in en.ts (and any other languages) and the site
 * renders it. Missing keys fall back to the Chinese version so partial
 * translations never show empty strings.
 */

export const zh = {
  // Navigation
  'nav.home': '首页',
  'nav.posts': '文章',
  'nav.topics': '主题',
  'nav.tags': '标签',
  'nav.graph': '关系图',
  'nav.resources': '资源',

  // Site meta
  'site.search': '搜索',
  'site.searchPlaceholder': '搜索文章、标签...',
  'site.postsAndTags': '{posts} 篇 · {tags} 标签',
  'site.toggleTheme': '切换主题',

  // Theme names (shown in dropdown)
  'theme.light': '明亮',
  'theme.dark': '暗夜',
  'theme.sepia': '护眼',
  'theme.cyberpunk': '赛博',

  // Language switcher
  'lang.switch': '语言',
  'lang.zh': '中文',
  'lang.en': 'English',

  // Home
  'home.heading': '写一次, 即开即用博客',
  'home.browseAll': '浏览全部文章',
  'home.viewGraph': '查看关系图',
  'home.stats': '共 {posts} 篇文章 · {tags} 个标签 · {links} 条 wiki 链接',
  'home.searchPosts': '搜索文章...',
  'home.filter.latest': '最新',
  'home.filter.popular': '热门',
  'home.filter.all': '全部',
  'home.featured': '精选',

  // Blog list
  'blog.title': '所有文章',
  'blog.subtitle': '浏览所有 Obsidian 风格的博客文章',
  'blog.empty': 'vault 里还没有任何文章 —— 在 vault 里加一篇 .md 试试。',

  // Post
  'post.backToList': '返回列表',
  'post.minutes': '分钟',
  'post.tagsCount': '{count} 个标签',
  'post.toc': '目录',
  'post.tocMobile': '目录 ({count})',
  'post.readingProgress': '阅读进度',
  'post.backlinks': '引用了这篇文章 ({count})',
  'post.prev': '上一篇',
  'post.next': '下一篇',
  'post.copyLink': '复制链接',
  'post.linkCopied': '已复制',

  // Topics
  'topics.title': '主题簇',
  'topics.subtitle': '按 Obsidian 文件夹结构组织的{concepts}主题门户。',
  'topics.pillar': 'Pillar',
  'topics.cluster': 'Cluster',
  'topics.empty': 'vault 里还没有任何带子文件夹的文章 —— 创建一个子目录试试。',
  'topics.posts': '{count} 篇',
  'topics.browse': '浏览',
  'topics.postsInCluster': '{cluster} 中的文章',

  // Tags
  'tags.title': '标签',
  'tags.subtitle': '按标签浏览所有文章',
  'tags.allTag': '全部',
  'tags.empty': 'vault 里还没有任何标签',
  'tags.countOne': '{count} 篇',
  'tags.countMany': '{count} 篇',
  'tags.postsWith': '标签为「{tag}」的文章 ({count} 篇)',

  // Graph
  'graph.title': '关系图',
  'graph.subtitle': '文章之间的 wiki-link 关系可视化',
  'graph.search': '搜索节点...',
  'graph.fullscreen': '全屏',
  'graph.exitFullscreen': '退出全屏',
  'graph.reset': '重置视图',
  'graph.hideOrphans': '隐藏孤立节点',
  'graph.showOrphans': '显示孤立节点',
  'graph.empty': 'vault 里的文章还没有任何 wiki-link,添加 [[双链]] 试试。',
  'graph.openPost': '打开文章 (双击节点)',

  // Resources
  'resources.title': '资源',
  'resources.subtitle': '我写博客、做笔记、用 Obsidian 的过程中用到的工具、参考与外部链接。',
  'resources.configNote': '内容在',
  'resources.configNoteOf': '的',
  'resources.configNoteSection': '段配置。',
  'resources.empty': '还没配置任何资源。打开你 vault 根目录的 {file},在 frontmatter 里加 {section}：',
  'resources.backHome': '返回首页',

  // About / Privacy / Contact
  'about.title': '关于本站',
  'privacy.title': '隐私政策',
  'contact.title': '联系我们',

  // Cookie consent
  'cookie.title': '关于 Cookie 与广告',
  'cookie.description': '本站使用必要 Cookie 记住你的偏好;在你同意后,Google AdSense 才会写入广告 Cookie 用于个性化内容。详见 {policy}。',
  'cookie.essential': '仅必需',
  'cookie.acceptAll': '同意全部',
  'cookie.policy': '隐私政策',
  'cookie.settingsButton': 'Cookie 偏好设置',
  'cookie.settingsHint': '本站默认不显示 Cookie 横幅,新访问者视为「仅必需」。需要修改你的偏好(开启个性化广告等)可以点这个按钮重新选择。',

  // 404 / misc
  'notFound.title': '页面不存在',
  'notFound.goHome': '回到首页',
  'loading': '加载中...',

  // Footer
  'footer.poweredBy': '由 blog-system 的设计语言 + Obsidian 兼容层驱动',

  // Time
  'time.justNow': '刚刚',
  'time.minutesAgo': '{n} 分钟前',
  'time.hoursAgo': '{n} 小时前',
  'time.daysAgo': '{n} 天前',
} as const;

export type TranslationKey = keyof typeof zh;
