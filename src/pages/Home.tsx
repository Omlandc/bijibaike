import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import * as d3 from 'd3';
import { ArrowRight, Sparkles, Search, Calendar, TrendingUp, Tag as TagIcon, Clock, Pin, FileText, FolderTree, Network, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllTags, getAllPillars } from '@/lib/content';
import { siteConfig } from '@/config/site-config';
import { useTranslation } from '@/i18n';

interface SimNode {
  id: string;
  title: string;
  tags: string[];
  level: string;
  degree: number;
  x?: number;
  y?: number;
  /** Depth in 3D space. Assigned once after sim converges; positive
   *  is in front of the screen, negative behind. Used by the RAF
   *  Y-axis rotation loop to project the node to 2D each frame. */
  z?: number;
}

interface SimEdge {
  source: SimNode | string;
  target: SimNode | string;
  weight: number;
}

const GRAPH_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#a855f7',
];

function colorForTag(tag: string | undefined, title: string): string {
  if (tag) {
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    return GRAPH_PALETTE[h % GRAPH_PALETTE.length]!;
  }
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 17 + title.charCodeAt(i)) >>> 0;
  return GRAPH_PALETTE[h % GRAPH_PALETTE.length]!;
}
function GraphPreviewMini() {
  const navigate = useNavigate();
  const posts = useMemo(() => getAllPosts().slice(0, 24), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, total: 0 });

  // Build the graph data the same way the main /graph page does:
  // resolve basename wiki-link targets against the full-slug map,
  // and de-duplicate edges.
  const data = useMemo(() => {
    const validSlugs = new Set(posts.map((p) => p.slug));
    const slugByBasename = new Map<string, string>();
    for (const p of posts) slugByBasename.set(p.basename, p.slug);
    const nodes: SimNode[] = posts.map((p) => {
      const tag = p.tags[0];
      return {
        id: p.slug,
        title: p.title,
        tags: p.tags,
        level: tag ?? 'untagged',
        degree: 0,
      };
    });
    const seen = new Set<string>();
    const edges: SimEdge[] = [];
    for (const p of posts) {
      for (const rawTarget of p.links) {
        const target = slugByBasename.get(rawTarget) ?? rawTarget;
        if (!validSlugs.has(target) || target === p.slug) continue;
        const key = [p.slug, target].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ source: p.slug, target, weight: 1 });
      }
    }
    for (const e of edges) {
      const s = typeof e.source === 'string' ? e.source : (e.source as SimNode).id;
      const t = typeof e.target === 'string' ? e.target : (e.target as SimNode).id;
      const sn = nodes.find((n) => n.id === s);
      const tn = nodes.find((n) => n.id === t);
      if (sn) sn.degree++;
      if (tn) tn.degree++;
    }
    return { nodes, edges };
  }, [posts]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const svgEl = svgRef.current;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    function start() {
      if (cancelled) return;
      const rect = container.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) {
        requestAnimationFrame(start);
        return;
      }
      const width = rect.width;
      const height = rect.height;

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      // Glow filter for the active node (same trick as main /graph)
      const defs = svg.append('defs');
      const merge = defs
        .append('filter')
        .attr('id', 'gpm-node-glow-merged')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      merge.append('feGaussianBlur').attr('stdDeviation', '1.6').attr('result', 'blur');
      merge
        .append('feMerge')
        .selectAll('feMergeNode')
        .data(['blur', 'SourceGraphic'])
        .join('feMergeNode')
        .attr('in', (d) => d as string);

      const g = svg.append('g');

      // Seed positions around the center so the first frame is
      // already a recognizable cloud, not a single pile at (0,0).
      const simNodes: SimNode[] = data.nodes.map((n) => {
        const seedX = width / 2 + (Math.random() - 0.5) * 120;
        const seedY = height / 2 + (Math.random() - 0.5) * 80;
        return { ...n, x: seedX, y: seedY };
      });
      const simEdges: SimEdge[] = data.edges.map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      }));

      const link = g
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(simEdges)
        .join('line')
        .attr('class', 'graph-link')
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 0.7)
        .attr('stroke-opacity', 0.4);

      const node = g
        .append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, SimNode>('g')
        .data(simNodes, (d) => d.id)
        .join('g')
        .attr('class', 'graph-node')
        .attr('data-id', (d) => d.id)
        .style('cursor', 'pointer');

      // Mini sizing: smaller baseR, smaller maxR, tighter collide radius.
      const baseR = 3;
      const maxR = 8;
      const labelMax = 56;

      node
        .append('circle')
        .attr('r', (d) => baseR + Math.min(maxR, Math.sqrt(d.degree) * 1.6))
        .attr('fill', (d) => colorForTag(d.level, d.title))
        .attr('stroke', 'var(--color-bg-elevated)')
        .attr('stroke-width', 1.2);

      // Show labels for nodes that have at least one connection, so
      // degree-0 nodes don't pile up text and crowd the mini view.
      node
        .filter((d) => d.degree >= 1)
        .append('text')
        .text((d) => {
          const t = d.title;
          return t.length > 6 ? t.slice(0, 6) + '…' : t;
        })
        .attr('x', 8)
        .attr('y', 3)
        .attr('font-size', 8)
        .attr('fill', 'currentColor')
        .attr('class', 'graph-label')
        .attr('textLength', (d) => Math.min(labelMax, d.title.length * 6.5))
        .attr('lengthAdjust', 'spacingAndGlyphs');

      // Assign 3D depth to each node. We bias the depth so that
      // higher-degree (hub) nodes sit slightly forward and the long
      // tail recedes behind — gives a stronger sense of depth when
      // the graph rotates. The z range [-80, 80] is tuned to look
      // 3D without clipping the 360×180 viewport.
      for (const n of simNodes) {
        n.z = (Math.random() - 0.5) * 140 + Math.min(36, n.degree * 6);
      }

      // Projection + RAF state. theta goes 0..2π for one full turn
      // (≈45s at the speed below). focal length controls how
      // aggressive the perspective looks — smaller = more dramatic.
      const cx = width / 2;
      const cy = height / 2;
      const focal = 220;
      const zMax = 100; // for opacity normalization
      let theta = 0;
      let rafId: number | null = null;
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Project a 3D point to 2D, with a perspective scale and an
      // opacity that fades to 0.25 at the back. We rotate around the
      // world Y axis (vertical) — the y screen coord stays put; the
      // screen x and the depth both shift with cos/sin(theta).
      function project(n: SimNode, t: number) {
        const dx = (n.x ?? cx) - cx;
        const z = n.z ?? 0;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        // 3D point (dx, dy=0, z) rotated about Y by t, then we only
        // keep the screen X and the (now-shifted) depth for opacity.
        const xScreen = cx + dx * cos + z * sin;
        const z3d = -dx * sin + z * cos;
        // Perspective: scale = focal / (focal - z3d). When the point
        // is closer than focal this explodes; clamp with a min.
        const denom = Math.max(60, focal - z3d);
        const scale = focal / denom;
        // Map z3d ∈ [-zMax, zMax] → opacity ∈ [0.28, 1.0]. Points
        // behind the screen fade; points in front stay bright.
        const norm = Math.max(-1, Math.min(1, z3d / zMax));
        const opacity = 0.28 + 0.72 * ((norm + 1) / 2);
        return { x: xScreen, y: n.y ?? cy, scale, opacity, z3d };
      }

      const sim = d3
        .forceSimulation<SimNode>(simNodes)
        .force(
          'link',
          d3
            .forceLink<SimNode, SimEdge>(simEdges)
            .id((d) => d.id)
            .distance(38)
            .strength(0.7),
        )
        .force('charge', d3.forceManyBody().strength(-160))
        .alpha(0.7)
        .alphaDecay(0.04)
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(16))
        .on('tick', () => {
          // While the sim is settling, paint a flat (no-rotation)
          // projection. Once it converges, the 'end' handler below
          // takes over with the rotating projection.
          if (rafId == null) {
            link
              .attr('x1', (d) => (d.source as SimNode).x!)
              .attr('y1', (d) => (d.source as SimNode).y!)
              .attr('x2', (d) => (d.target as SimNode).x!)
              .attr('y2', (d) => (d.target as SimNode).y!);
            node.attr('transform', (d) => `translate(${d.x},${d.y})`);
          }
        })
        .on('end', () => {
          if (reduceMotion) return; // user opted out of motion
          const tickMs = 1000 / 30; // 30fps is plenty for a slow spin
          let last = performance.now();
          const speed = (Math.PI * 2) / 45000; // 45s per full turn
          const loop = (now: number) => {
            if (now - last >= tickMs) {
              last = now;
              theta += speed * (now - last + tickMs);
              if (theta > Math.PI * 2) theta -= Math.PI * 2;
              // Update edges: redraw with projected endpoints.
              // Stroke opacity uses the mean of the two endpoints'
              // projected opacities so links fade into the back.
              link.each(function (d: any) {
                const a = project(d.source, theta);
                const b = project(d.target, theta);
                d3.select(this)
                  .attr('x1', a.x)
                  .attr('y1', a.y)
                  .attr('x2', b.x)
                  .attr('y2', b.y)
                  .attr('stroke-opacity', Math.min(a.opacity, b.opacity) * 0.45);
              });
              // Update nodes: translate + scale (anchor at the
              // node center via the inner <circle>).
              node.each(function (d: any) {
                const p = project(d, theta);
                d3.select(this)
                  .attr('transform', `translate(${p.x},${p.y}) scale(${p.scale})`)
                  .attr('opacity', p.opacity);
              });
            }
            rafId = requestAnimationFrame(loop);
          };
          rafId = requestAnimationFrame(loop);
        });

      setStats({ nodes: simNodes.length, edges: simEdges.length, total: data.nodes.length });

      // Same highlight() as the main page: hover-id → active + neighbor
      // classes, non-neighbors → dim, unrelated edges → dim.
      function highlight(id: string | null) {
        if (!id) {
          node.classed('dim', false).classed('active', false).classed('neighbor', false);
          link.classed('dim', false);
          return;
        }
        const neighbors = new Set([id]);
        simEdges.forEach((e) => {
          const s = typeof e.source === 'string' ? e.source : (e.source as SimNode).id;
          const t = typeof e.target === 'string' ? e.target : (e.target as SimNode).id;
          if (s === id) neighbors.add(t);
          if (t === id) neighbors.add(s);
        });
        node
          .classed('dim', (d) => !neighbors.has(d.id))
          .classed('active', (d) => d.id === id)
          .classed('neighbor', (d) => d.id !== id && neighbors.has(d.id));
        link.classed('dim', (d) => {
          const s = typeof d.source === 'string' ? d.source : (d.source as SimNode).id;
          const t = typeof d.target === 'string' ? d.target : (d.target as SimNode).id;
          return s !== id && t !== id;
        });
      }

      // Find the data-id of the .graph-node that owns this event
      const findNodeId = (target: EventTarget | null): string | null => {
        let el = target as Element | null;
        while (el && el !== svgEl) {
          if (el.classList && el.classList.contains('graph-node')) {
            return (el as HTMLElement).getAttribute('data-id');
          }
          el = el.parentElement;
        }
        return null;
      };

      // Click a node → jump to the post. We stop propagation so the
      // outer card's link-to-/graph (if any) doesn't fire too.
      const onClick = (e: MouseEvent) => {
        const id = findNodeId(e.target);
        if (!id) return;
        e.stopPropagation();
        e.preventDefault();
        window.location.hash = `#/blog/${encodeURIComponent(id)}`;
        // Also call navigate for SPA-friendliness; the hash fallback
        // ensures it works even if the router hasn't mounted.
        navigate(`/blog/${encodeURIComponent(id)}`);
      };

      const onMouseOver = (e: MouseEvent) => {
        const id = findNodeId(e.target);
        if (id) highlight(id);
      };

      const onMouseOut = (e: MouseEvent) => {
        const related = e.relatedTarget as Element | null;
        if (!related || !svgEl.contains(related)) highlight(null);
        else if (!related.closest('.graph-node')) highlight(null);
      };

      svgEl.addEventListener('click', onClick);
      svgEl.addEventListener('pointerover', onMouseOver);
      svgEl.addEventListener('pointerout', onMouseOut);

      cleanup = () => {
        svgEl.removeEventListener('click', onClick);
        svgEl.removeEventListener('pointerover', onMouseOver);
        svgEl.removeEventListener('pointerout', onMouseOut);
        if (rafId != null) cancelAnimationFrame(rafId);
        sim.stop();
      };
    }

    requestAnimationFrame(start);
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [data, navigate]);

  return (
    <div ref={containerRef} className="graph-svg gpm-svg relative h-full w-full">
      <svg ref={svgRef} className="block h-full w-full overflow-visible" />
      <div className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-[9px] text-fg-muted/60">
        {stats.nodes} 个节点 · {stats.edges} 条 wiki link
      </div>
    </div>
  );
}

export default function Home() {
  const allPosts = getAllPosts();
  const allTags = getAllTags();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPosts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (q) {
        const hay = `${p.title} ${p.excerpt}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allPosts, search, activeTag]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'latest') {
      arr.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      arr.sort((a, b) => {
        const ap = a.frontmatter.pinned ? 1 : 0;
        const bp = b.frontmatter.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return b.tags.length - a.tags.length || b.date.localeCompare(a.date);
      });
    }
    return arr;
  }, [filtered, sort]);

  const featured = sorted.find((p) => p.frontmatter.pinned) ?? sorted[0];
  const rest = sorted.filter((p) => p !== featured);
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <section className="bg-glow relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-elevated to-bg p-8 sm:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-fg-muted">
            <Sparkles className="size-3 text-primary" />
            <span>Obsidian 兼容</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl">
            {(() => {
              // Split tagline at the first comma so the head stays
              // default-color and the tail gets the primary highlight.
              // siteConfig.tagline uses a half-width comma (per the
              // vault config convention); we tolerate the full-width
              // one too in case the user typed it that way.
              const raw = siteConfig.site.tagline ?? '';
              const m = raw.match(/^(.+?)[,，]\s*(.+)$/);
              if (m) {
                return (
                  <>
                    {m[1]}
                    <span className="text-primary">，{m[2]}</span>
                  </>
                );
              }
              return <span className="text-primary">{raw}</span>;
            })()}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-fg-muted sm:text-lg">
            {siteConfig.site.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/blog">
                {t('home.browseAll')} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/graph">{t('home.viewGraph')}</Link>
            </Button>
          </div>
          <div className="mt-6 text-xs text-fg-muted">
            {t('home.stats', {
              posts: allPosts.length,
              tags: allTags.length,
              links: allPosts.reduce((acc, p) => acc + p.links.length, 0),
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated">
          <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-5 py-3">
            <div className="flex items-center gap-2 text-fg">
              <FolderTree className="size-4 text-primary" />
              <h2 className="text-base font-semibold">{t('topics.title')}</h2>
            </div>
            <Link
              to="/topics"
              className="inline-flex items-center gap-0.5 text-xs text-fg-muted group-hover:text-primary"
            >
              {t('topics.browse')}
              <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="flex-1 p-5">
            {getAllPillars().length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-bg p-6 text-center text-xs text-fg-muted">
                还没有主题簇 — 在 vault 里创建子目录
              </div>
            ) : (
              <ul className="space-y-1.5">
                {getAllPillars().map((pillar) => (
                  <li key={pillar.slug}>
                    <Link
                      to={`/topics/${encodeURIComponent(pillar.slug)}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:border-border hover:bg-bg"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-fg">{pillar.name}</div>
                        {pillar.description ? (
                          <div className="line-clamp-1 text-xs text-fg-muted">{pillar.description}</div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-xs text-fg-subtle">{pillar.postCount} 篇</div>
                      <ChevronRight className="size-3.5 shrink-0 text-fg-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated">
          <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-5 py-3">
            <div className="flex items-center gap-2 text-fg">
              <Network className="size-4 text-primary" />
              <h2 className="text-base font-semibold">{t('graph.title')}</h2>
            </div>
            <Link
              to="/graph"
              className="inline-flex items-center gap-0.5 text-xs text-fg-muted group-hover:text-primary"
            >
              {t('home.viewGraph')}
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="relative flex-1 p-3" style={{ minHeight: '200px' }}>
            <GraphPreviewMini />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            placeholder={t('home.searchPosts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-bg-elevated p-0.5">
          <button
            type="button"
            onClick={() => setSort('latest')}
            className={cn('flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors', sort === 'latest' ? 'bg-primary text-primary-foreground' : 'text-fg-muted hover:text-fg')}
          >
            <Calendar className="size-3" />
            {t('home.filter.latest')}
          </button>
          <button
            type="button"
            onClick={() => setSort('hot')}
            className={cn('flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors', sort === 'hot' ? 'bg-primary text-primary-foreground' : 'text-fg-muted hover:text-fg')}
          >
            <TrendingUp className="size-3" />
            {t('home.filter.popular')}
          </button>
        </div>
      </div>

      {allTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <TagIcon className="size-4 text-fg-muted" />
          <button
            type="button"
            onClick={() => setActiveTag('')}
            className={cn('rounded-full border px-3 py-1 text-xs transition-colors', !activeTag ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-fg-muted hover:text-fg')}
          >
            {t('home.filter.all')}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => setActiveTag(tag.name === activeTag ? '' : tag.name)}
              className={cn('rounded-full border px-3 py-1 text-xs transition-colors', activeTag === tag.name ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-fg-muted hover:text-fg')}
            >
              {tag.name} <span className="opacity-60">({tag.count})</span>
            </button>
          ))}
        </div>
      ) : null}

      {featured ? (
        <Link
          to={`/blog/${encodeURIComponent(featured.slug)}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_2fr] sm:p-8">
            <FeaturedCover post={featured} />
            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  {featured.frontmatter.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      <Pin className="size-3" />精选
                    </span>
                  ) : null}
                  {featured.tags[0] ? (
                    <span className="rounded-full border border-border px-2 py-0.5">{featured.tags[0]}</span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {Math.max(1, Math.round(featured.raw.length / 600))} 分钟
                  </span>
                </div>
                <h2 className="text-balance text-2xl font-bold tracking-tight text-fg group-hover:text-primary sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.frontmatter.description ? (
                  <p className="mt-3 text-fg-muted">{String(featured.frontmatter.description)}</p>
                ) : (
                  <p className="mt-3 line-clamp-3 text-fg-muted">{featured.excerpt}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
                <span>
                  {new Date(featured.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 text-primary transition-all group-hover:gap-2">
                  阅读全文 <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostGridCard key={p.slug} post={p} />
          ))}
        </div>
      ) : !featured ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-fg-muted">
          还没有文章可显示
        </div>
      ) : null}
    </div>
  );
}

function FeaturedCover({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  const cover = post.cover;
  if (cover) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-square">
        <img src={cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-bg-elevated to-bg-subtle p-6 sm:aspect-square">
      <FileText className="size-10 text-fg-subtle/50" strokeWidth={1.5} />
      {post.tags[0] ? (
        <span className="rounded-full border border-border bg-bg/60 px-3 py-1 text-xs text-fg-muted">{post.tags[0]}</span>
      ) : null}
    </div>
  );
}

function PostGridCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  const cover = post.cover;
  const readingMinutes = Math.max(1, Math.round(post.raw.length / 600));
  const description = typeof post.frontmatter.description === 'string' ? post.frontmatter.description : post.excerpt;
  return (
    <Link
      to={`/blog/${encodeURIComponent(post.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all hover:border-primary/40 hover:shadow-elevated"
    >
      {cover ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img src={cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.tags[0] ? (
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10px] font-medium text-fg-muted">{post.tags[0]}</span>
        ) : null}
        <h3 className="line-clamp-2 text-base font-semibold text-fg group-hover:text-primary">{post.title}</h3>
        {description ? <p className="line-clamp-2 text-sm text-fg-muted">{description}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1"><Clock className="size-3" />{readingMinutes} 分钟</span>
          <span>{new Date(post.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
}
