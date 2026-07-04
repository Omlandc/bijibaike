import { Link } from 'react-router';
import { BookOpen, ExternalLink, Home as HomeIcon, ChevronRight } from 'lucide-react';
import { siteConfig } from '@/config/site-config';
import { useTranslation } from '@/i18n';

export default function Resources() {
  const { sections, subtitle } = siteConfig.resources;
  const { t, lang } = useTranslation();
  const resolvedSubtitle = subtitle
    ? (typeof subtitle === 'string' ? subtitle : subtitle[lang] ?? subtitle.zh ?? subtitle.en ?? '')
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-fg-muted">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-bg-subtle hover:text-fg"
        >
          <HomeIcon className="size-3" />
          首页
        </Link>
        <ChevronRight className="size-3" />
        <span className="rounded bg-bg-subtle px-1.5 py-0.5 font-medium text-fg">资源</span>
      </nav>

      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-fg">
          <BookOpen className="size-6 text-primary" />
          {t('resources.title')}
        </h1>
        <p className="text-sm text-fg-muted">
          {resolvedSubtitle ?? t('resources.subtitle')} {t('resources.configNote')}{' '}
          <code className="rounded bg-bg-subtle px-1 text-fg">vault/_config.md</code>{' '}
          {t('resources.configNoteOf')}{' '}
          <code className="rounded bg-bg-subtle px-1 text-fg">resources</code>{' '}
          {t('resources.configNoteSection')}
        </p>
      </header>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated p-8 text-center">
          <p className="text-fg-muted">
            {t('lang.en') === 'English' ? (
              <>No resources yet. Open <code className="rounded bg-bg-subtle px-1 text-fg">_config.md</code> in your vault root and add the <code className="rounded bg-bg-subtle px-1 text-fg">resources.sections</code> section:</>
            ) : (
              <>还没配置任何资源。打开你 vault 根目录的 <code className="rounded bg-bg-subtle px-1 text-fg">_config.md</code>，在 frontmatter 里加 <code className="rounded bg-bg-subtle px-1 text-fg">resources.sections</code>：</>
            )}
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
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold tracking-tight text-fg">
                  {section.title}
                  <span className="ml-2 text-xs font-normal text-fg-muted">
                    ({section.items.length})
                  </span>
                </h2>
                {section.description ? (
                  <p className="text-xs text-fg-muted">{section.description}</p>
                ) : null}
              </div>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        className="group flex h-full flex-col rounded-md border border-border bg-bg-elevated p-2.5 transition-all hover:border-primary/40 hover:bg-bg-subtle"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="line-clamp-1 text-sm font-medium text-fg group-hover:text-primary">
                            {item.title}
                          </span>
                          <ExternalLink className="size-3 shrink-0 text-fg-muted group-hover:text-primary" />
                        </div>
                        {item.description ? (
                          <p className="mt-1 line-clamp-1 text-xs text-fg-muted">
                            {item.description}
                          </p>
                        ) : null}
                        {host ? (
                          <span className="mt-1.5 truncate text-[10px] text-fg-subtle">
                            {host}
                          </span>
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
