import { Link } from 'react-router';
import { FolderTree, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllPillars, type Pillar } from '@/lib/content';
import { siteConfig } from '@/config/site-config';

export default function Topics() {
  // Auto-discovered from vault folder structure, then re-ordered to
  // match `pillars` in vault/_config.md. Any pillar in config that
  // doesn't exist on disk is silently dropped. Pillars NOT in config
  // still show up after the configured ones (so adding a new vault
  // folder never produces a blank /topics page).
  const discovered = getAllPillars();
  const cfgPillars = siteConfig.pillars;
  const byName = new Map(discovered.map((p) => [p.name, p]));
  const ordered: Pillar[] = [
    ...cfgPillars
      .map((c) => byName.get(c.name))
      .filter((p): p is Pillar => p !== undefined)
      .map((p, i) => {
        const cfg = cfgPillars[i];
        return cfg?.description
          ? { ...p, description: cfg.description }
          : p;
      }),
    ...discovered.filter((p) => !cfgPillars.some((c) => c.name === p.name)),
  ];
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">主题簇</h1>
        </div>
        <p className="text-fg-muted">
          按 Obsidian 文件夹结构组织的<strong className="text-fg">主题门户</strong>。
          每个顶层目录是一个 <Badge variant="secondary" className="rounded-full">Pillar</Badge>,
          往下细分 <Badge variant="secondary" className="rounded-full">Cluster</Badge> 与具体文章。
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ordered.map((pillar) => (
          <PillarCard key={pillar.slug} pillar={pillar} />
        ))}
      </div>

      {ordered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-fg-muted">
            vault 里还没有任何带子文件夹的文章 —— 创建一个子目录试试。
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <Link
      to={`/topics/${encodeURIComponent(pillar.slug)}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-elevated">
        {pillar.cover ? (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={pillar.cover}
              alt={pillar.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="aspect-[16/9] bg-gradient-to-br from-bg-elevated to-bg-subtle"
            aria-hidden
          >
            <div className="flex size-full items-center justify-center">
              <FolderTree className="size-10 text-fg-subtle/40 transition-colors group-hover:text-primary/60" />
            </div>
          </div>
        )}
        <CardContent className="space-y-3 p-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg transition-colors group-hover:text-primary">
                {pillar.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                <BookOpen className="size-3" />
                {pillar.postCount}
              </span>
            </div>
            {pillar.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{pillar.description}</p>
            ) : null}
          </div>
          {pillar.clusters.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pillar.clusters.slice(0, 4).map((c) => (
                <Badge key={c.slug} variant="secondary" className="rounded-full text-[10px]">
                  {c.name}
                  <span className="ml-1 opacity-60">{c.posts.length}</span>
                </Badge>
              ))}
              {pillar.clusters.length > 4 ? (
                <Badge variant="secondary" className="rounded-full text-[10px] text-fg-muted">
                  +{pillar.clusters.length - 4}
                </Badge>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center justify-end text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            浏览 <ArrowRight className="ml-1 size-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}