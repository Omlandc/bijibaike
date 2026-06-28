import { Link } from 'react-router';
import { BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site-config';

export default function Resources() {
  const { sections } = siteConfig.resources;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-1 size-3.5" />
            返回首页
          </Link>
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-fg">
          <BookOpen className="size-7 text-primary" />
          资源
        </h1>
        <p className="text-fg-muted">
          我在写博客、做笔记、用 Obsidian 的过程中用到的工具、参考与有意思的链接。
          内容在 <code className="rounded bg-bg-subtle px-1 text-fg">vault/_config.md</code>{' '}
          的 <code className="rounded bg-bg-subtle px-1 text-fg">resources</code> 段配置。
        </p>
      </header>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated p-8 text-center">
          <p className="text-fg-muted">
            还没配置任何资源。打开你 vault 根目录的 <code className="rounded bg-bg-subtle px-1 text-fg">_config.md</code>，
            在 frontmatter 里加 <code className="rounded bg-bg-subtle px-1 text-fg">resources.sections</code>：
          </p>
          <pre className="mx-auto mt-4 max-w-md overflow-auto rounded-md bg-bg p-3 text-left text-xs">
{`resources:
  sections:
    - title: 工具
      items:
        - title: Obsidian
          url: https://obsidian.md
          description: 知识管理工具`}
          </pre>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-fg">
                  {section.title}
                </h2>
                {section.description ? (
                  <p className="text-sm text-fg-muted">{section.description}</p>
                ) : null}
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => {
                  const host = (() => {
                    try {
                      return new URL(item.url).host.replace(/^www\./, '');
                    } catch {
                      return '';
                    }
                  })();
                  return (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col rounded-lg border border-border bg-bg-elevated p-4 transition-all hover:border-primary/40 hover:bg-bg-subtle"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-fg group-hover:text-primary">
                            {item.title}
                          </span>
                          <ExternalLink className="size-3.5 shrink-0 text-fg-muted group-hover:text-primary" />
                        </div>
                        {item.description ? (
                          <p className="mt-2 line-clamp-3 text-sm text-fg-muted">
                            {item.description}
                          </p>
                        ) : null}
                        {host ? (
                          <Badge
                            variant="secondary"
                            className="mt-3 w-fit rounded-full text-[10px] font-normal text-fg-muted"
                          >
                            {host}
                          </Badge>
                        ) : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
