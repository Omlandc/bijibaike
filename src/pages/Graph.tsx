import { useMemo } from 'react';
import { Link } from 'react-router';
import { Network } from 'lucide-react';
import { getAllPosts } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Node {
  slug: string;
  title: string;
  x: number;
  y: number;
  degree: number;
}

interface Edge {
  source: Node;
  target: Node;
}

function layout(posts: ReturnType<typeof getAllPosts>): { nodes: Node[]; edges: Edge[] } {
  const deg: Record<string, number> = {};
  const linkPairs: Array<[string, string]> = [];
  const validSlugs = new Set(posts.map((p) => p.slug));
  for (const p of posts) {
    for (const target of p.links) {
      if (!validSlugs.has(target) || target === p.slug) continue;
      const key = [p.slug, target].sort().join('::');
      const dup = linkPairs.some(([a, b]) => [a, b].sort().join('::') === key);
      if (!dup) linkPairs.push([p.slug, target]);
      deg[p.slug] = (deg[p.slug] ?? 0) + 1;
      deg[target] = (deg[target] ?? 0) + 1;
    }
  }
  const sorted = [...posts].sort((a, b) => (deg[b.slug] ?? 0) - (deg[a.slug] ?? 0));
  const cx = 400;
  const cy = 320;
  const r = 240;
  const nodes: Node[] = sorted.map((p, i) => {
    const angle = (i / Math.max(1, sorted.length)) * Math.PI * 2 - Math.PI / 2;
    return {
      slug: p.slug,
      title: p.title,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      degree: deg[p.slug] ?? 0,
    };
  });
  const bySlug: Record<string, Node> = Object.fromEntries(nodes.map((n) => [n.slug, n]));
  const edges: Edge[] = linkPairs
    .map(([a, b]) => {
      const sa = bySlug[a];
      const sb = bySlug[b];
      if (!sa || !sb) return null;
      return { source: sa, target: sb };
    })
    .filter((e): e is Edge => e !== null);
  return { nodes, edges };
}

export default function Graph() {
  const posts = useMemo(() => getAllPosts(), []);
  const { nodes, edges } = useMemo(() => layout(posts), [posts]);

  if (nodes.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-fg">关系图</h1>
        <p className="text-fg-muted">还没有文章可显示。</p>
      </div>
    );
  }

  const totalDegree = nodes.reduce((acc, n) => acc + n.degree, 0);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <Network className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">关系图</h1>
        </div>
        <p className="text-fg-muted">
          {nodes.length} 个节点 · {edges.length} 条 wikilink 引用 ·{' '}
          {totalDegree} 总连接度 · 节点大小 = 引用度
        </p>
      </header>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <svg
            viewBox="0 0 800 640"
            className="h-auto w-full"
            role="img"
            aria-label="文章引用关系图"
          >
            <defs>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* edges */}
            {edges.map((e, i) => (
              <line
                key={i}
                x1={e.source.x}
                y1={e.source.y}
                x2={e.target.x}
                y2={e.target.y}
                stroke="var(--color-border)"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
            ))}
            {/* nodes */}
            {nodes.map((n) => {
              const size = 10 + Math.min(28, n.degree * 6);
              return (
                <g key={n.slug} className="cursor-pointer">
                  {/* glow halo for nodes with incoming refs */}
                  {n.degree > 0 ? (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={size + 14}
                      fill="url(#nodeGlow)"
                    />
                  ) : null}
                  <Link to={`/blog/${n.slug}`}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={size}
                      fill="var(--color-primary)"
                      stroke="var(--color-bg-elevated)"
                      strokeWidth={3}
                      className="transition-all hover:fill-[color:var(--color-accent)]"
                    />
                    <text
                      x={n.x}
                      y={n.y - size - 10}
                      textAnchor="middle"
                      className="fill-fg text-[12px] font-medium"
                    >
                      {n.title.length > 16 ? n.title.slice(0, 15) + '…' : n.title}
                    </text>
                    {n.degree > 0 ? (
                      <text
                        x={n.x}
                        y={n.y + size + 16}
                        textAnchor="middle"
                        className="fill-fg-muted text-[10px]"
                      >
                        {n.degree} 个引用
                      </text>
                    ) : null}
                  </Link>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6 text-sm text-fg-muted">
          <p>
            💡 在文章中用 <code className="rounded bg-bg-subtle px-1 text-fg">[[双链]]</code>{' '}
            引用其他文章,它们就会出现在这张图上。
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span>标签统计:</span>
            {posts.slice(0, 6).map((p) => (
              <Badge key={p.slug} variant="secondary" className="rounded-full">
                {p.title} · {p.links.length}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}