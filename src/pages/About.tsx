import { Sparkles, Github, Heart, BookOpen, Tag, Network, Code2, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router';
import { getAllPosts, getAllTags } from '@/lib/content';

export default function About() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">关于本站</h1>
        </div>
        <p className="text-fg-muted">
          一个<strong className="text-fg">写一次、在两个地方读</strong>
          的博客 —— 用 Obsidian 在本地写,自动同步到 Web 上浏览。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-fg">{posts.length}</span>
              <BookOpen className="size-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-fg-muted">已发布文章</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-fg">{tags.length}</span>
              <Tag className="size-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-fg-muted">唯一标签</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-fg">
                {posts.reduce((s, p) => s + p.links.length, 0)}
              </span>
              <Network className="size-5 text-primary" />
            </div>
            <p className="mt-1 text-xs text-fg-muted">wikilink 引用</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">核心理念</h2>
          <p className="text-fg-muted">
            写博客最痛苦的不是写,是<strong className="text-fg">同步和分发</strong>。
            你装 Obsidian 是因为喜欢本地编辑、双链、Markdown,但朋友想看你的笔记得下载客户端,
            搜索引擎看不到,你也懒得维护一个 CMS。
          </p>
          <p className="text-fg-muted">
            这个站做一件事:把 <code className="rounded bg-bg-subtle px-1 text-fg">vault/*.md</code>{' '}
            编译成静态网站,直接发到 CDN 上。本地怎么写,Web 上就怎么读。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">技术栈</h2>
          <ul className="space-y-3 text-fg-muted">
            <li className="flex items-start gap-3">
              <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong className="text-fg">React 19 + Vite</strong> —— 启动 <span className="text-fg">毫秒</span> 级,SSR 不需要的纯 SPA。
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong className="text-fg">remark / rehype 插件链</strong> —— 自定义解析{' '}
                <code className="rounded bg-bg-subtle px-1 text-fg">[[双链]]</code>、
                <code className="rounded bg-bg-subtle px-1 text-fg">&gt; [!callout]</code>、
                frontmatter、inline <code className="rounded bg-bg-subtle px-1 text-fg">#tag</code>。
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Network className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong className="text-fg">D3 force-directed graph</strong> ——{' '}
                <Link to="/graph" className="text-primary underline-offset-4 hover:underline">
                  /graph
                </Link>{' '}
                自动布局 wikilink 关系,支持拖动 / 缩放 / 邻居高亮。
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong className="text-fg">seo-kit</strong> —— 本站自研的可配置 SEO 工具包,
                处理 sitemap / robots / JSON-LD / meta / AdSense 验证,统一写在{' '}
                <code className="rounded bg-bg-subtle px-1 text-fg">seo.config.ts</code>。
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
          <Github className="size-8 text-fg-muted" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-fg">开源</h2>
            <p className="text-sm text-fg-muted">
              整个 webapp + seo-kit 都开源在 GitHub。你可以 fork 一份,改改配置,跑出你自己的博客。
            </p>
          </div>
          <a
            href="https://github.com/Omlandc/obsidian-blog-webapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-sm text-fg transition-colors hover:bg-bg-subtle"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-fg-subtle">
        Built with <Heart className="inline size-3 text-rose-500" /> · 内容即仓库 ·{' '}
        <Link to="/privacy" className="text-fg-muted hover:text-fg">
          隐私
        </Link>{' '}
        ·{' '}
        <Link to="/contact" className="text-fg-muted hover:text-fg">
          联系
        </Link>
      </p>
    </div>
  );
}