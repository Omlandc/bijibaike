import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import * as d3 from 'd3';
import { FolderTree, Network, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllPosts, getAllPillars, getPillarBySlug, getClusterBySlug, type Post } from '@/lib/content';

// ============================================================================
// Left column: location tree — lists ALL pillars so users can switch
// context. The current post's pillar is open by default with the post
// highlighted (under its cluster if any, otherwise as a pillar-direct
// post). Other pillars are collapsed.
// ============================================================================

interface LocationTreeProps {
  post: Post;
}

function LocationTree({ post }: LocationTreeProps) {
  // Parse pillar/cluster out of sourcePath.
  const parts = post.sourcePath.split('/').filter(Boolean);
  const pillarName = parts.length >= 2 ? parts[0]! : null;
  const clusterName = parts.length >= 3 ? parts[1]! : null;
  const currentPillar = pillarName ? getPillarBySlug(pillarName) : null;
  const currentCluster =
    pillarName && clusterName ? getClusterBySlug(pillarName, clusterName) : null;

  const allPillars = getAllPillars();

  // Default: current pillar open, current cluster (if any) open.
  const [openPillars, setOpenPillars] = useState<Set<string>>(
    () => (currentPillar ? new Set([currentPillar.slug]) : new Set()),
  );
  const [openClusters, setOpenClusters] = useState<Set<string>>(
    () => (currentCluster ? new Set([currentCluster.slug]) : new Set()),
  );

  const togglePillar = (slug: string) => {
    setOpenPillars((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };
  const toggleCluster = (slug: string) => {
    setOpenClusters((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
      {/* Header: same row style as the Home two-column cards, but no
          separate bg/border on the header — the whole card is one
          rounded bg-bg-elevated surface so the line and background
          corners line up cleanly. */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-fg">
          <FolderTree className="size-4 text-primary" />
          <h2 className="text-base font-semibold">所在层级</h2>
        </div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-0.5 text-xs text-fg-muted hover:text-primary"
        >
          全部文章 <ChevronRight className="size-3" />
        </Link>
      </div>

      <div className="space-y-0.5 p-2 text-sm">
        {/* Current post is at the vault root (no pillar). */}
        {!currentPillar ? (
          <div className="rounded-md bg-bg-subtle px-3 py-2 text-fg-muted">
            <div className="flex items-center gap-2 text-fg">
              <FileText className="size-3.5" />
              <span className="line-clamp-1 font-medium">{post.title}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-primary">本文</span>
            </div>
            <p className="mt-1 text-xs text-fg-subtle">
              这篇文章不在任何 Pillar 下,直接放在 vault 根目录。
            </p>
          </div>
        ) : null}

        {allPillars.map((pillar) => {
          const isCurrentPillar = pillar.slug === currentPillar?.slug;
          const open = openPillars.has(pillar.slug) || isCurrentPillar;
          return (
            <div key={pillar.slug}>
              {/* Pillar row */}
              <div
                className={cn(
                  'group flex items-center gap-1.5 rounded px-2 py-1.5 hover:bg-bg-subtle',
                  isCurrentPillar && 'text-fg',
                )}
              >
                <button
                  type="button"
                  onClick={() => togglePillar(pillar.slug)}
                  className="inline-flex shrink-0 items-center justify-center text-fg-muted"
                  aria-label={open ? '折叠' : '展开'}
                >
                  {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                </button>
                <FolderTree
                  className={cn(
                    'size-3.5 shrink-0',
                    isCurrentPillar ? 'text-primary' : 'text-fg-muted',
                  )}
                />
                <Link
                  to={`/topics/${encodeURIComponent(pillar.slug)}`}
                  className={cn(
                    'line-clamp-1 flex-1 hover:text-primary',
                    isCurrentPillar ? 'font-medium' : '',
                  )}
                >
                  {pillar.name}
                </Link>
                <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                  {pillar.postCount} 篇
                </span>
              </div>

              {open ? (
                <ul className="ml-2 space-y-0.5 border-l border-border pl-2">
                  {/* Direct-pillar posts (no cluster) */}
                  {pillar.posts.map((p) => {
                    const isCurrent =
                      isCurrentPillar && clusterName == null && p.slug === post.slug;
                    return (
                      <li key={p.slug}>
                        {isCurrent ? (
                          <div className="flex items-center gap-2 rounded bg-primary/10 px-2 py-1 text-fg">
                            <FileText className="size-3 shrink-0 text-primary" />
                            <span className="line-clamp-1 flex-1 font-medium">{p.title}</span>
                            <span className="shrink-0 text-[10px] uppercase tracking-wider text-primary">本文</span>
                          </div>
                        ) : (
                          <Link
                            to={`/blog/${encodeURIComponent(p.slug)}`}
                            className="flex items-center gap-2 rounded px-2 py-1 text-fg-muted hover:bg-bg-subtle hover:text-fg"
                          >
                            <FileText className="size-3 shrink-0" />
                            <span className="line-clamp-1 flex-1">{p.title}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}

                  {/* Each cluster: collapsible */}
                  {pillar.clusters.map((c) => {
                    const isCurrentCluster = c.slug === currentCluster?.slug;
                    const clusterOpen = openClusters.has(c.slug) || isCurrentCluster;
                    return (
                      <li key={c.slug}>
                        <div
                          className={cn(
                            'flex items-center gap-1.5 rounded px-2 py-1 hover:bg-bg-subtle',
                            isCurrentCluster ? 'text-fg' : 'text-fg-muted',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleCluster(c.slug)}
                            className="inline-flex shrink-0 items-center justify-center"
                            aria-label={clusterOpen ? '折叠' : '展开'}
                          >
                            {clusterOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                          </button>
                          <FolderTree className="size-3 shrink-0 text-fg-muted" />
                          <Link
                            to={`/topics/${encodeURIComponent(pillar.slug)}/${encodeURIComponent(c.slug)}`}
                            className="line-clamp-1 flex-1 hover:text-primary"
                          >
                            {c.name}
                          </Link>
                          <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                            {c.posts.length}
                          </span>
                        </div>

                        {clusterOpen ? (
                          <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-2">
                            {c.posts.map((p) => {
                              const isCurrent =
                                isCurrentCluster && p.slug === post.slug;
                              return (
                                <li key={p.slug}>
                                  {isCurrent ? (
                                    <div className="flex items-center gap-2 rounded bg-primary/10 px-2 py-1 text-fg">
                                      <FileText className="size-3 shrink-0 text-primary" />
                                      <span className="line-clamp-1 flex-1 font-medium">{p.title}</span>
                                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-primary">本文</span>
                                    </div>
                                  ) : (
                                    <Link
                                      to={`/blog/${encodeURIComponent(p.slug)}`}
                                      className="flex items-center gap-2 rounded px-2 py-1 text-fg-muted hover:bg-bg-subtle hover:text-fg"
                                    >
                                      <FileText className="size-3 shrink-0" />
                                      <span className="line-clamp-1 flex-1">{p.title}</span>
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Right column: related-graph centered on the current post (with Y-axis
// 3D rotation, matching the Home mini graph's visual language).
// ============================================================================

interface RelatedGraphProps {
  post: Post;
  backlinks: { fromSlug: string; fromTitle: string }[];
}

interface SimNode {
  id: string;
  title: string;
  degree: number;
  x?: number;
  y?: number;
  z?: number;
  fx?: number | null;
  fy?: number | null;
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

function colorForTag(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRAPH_PALETTE[h % GRAPH_PALETTE.length]!;
}

/** Project a 3D point to 2D under Y-axis rotation, matching the
 *  RAF loop below. */
function projectY(
  n: SimNode,
  theta: number,
  cx: number,
  cy: number,
  _focal: number,
  zMax: number,
): { x: number; y: number; opacity: number } {
  const dx = (n.x ?? cx) - cx;
  const z = n.z ?? 0;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const xScreen = cx + dx * cos + z * sin;
  const z3d = -dx * sin + z * cos;
  const norm = Math.max(-1, Math.min(1, z3d / zMax));
  const opacity = 0.35 + 0.65 * ((norm + 1) / 2);
  return { x: xScreen, y: n.y ?? cy, opacity };
}

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function RelatedGraph({ post, backlinks }: RelatedGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });

  // Build the local data set: center = current post, neighbours =
  // every post that this post links to + every post that links to
  // this post.
  const { nodes, edges } = useMemo(() => {
    const all = getAllPosts();
    const bySlug = new Map(all.map((p) => [p.slug, p] as const));
    const slugByBasename = new Map<string, string>();
    for (const p of all) slugByBasename.set(p.basename, p.slug);

    const neighbourIds = new Set<string>();
    for (const t of post.links) {
      const resolved = slugByBasename.get(t) ?? t;
      if (bySlug.has(resolved) && resolved !== post.slug) neighbourIds.add(resolved);
    }
    for (const bl of backlinks) {
      if (bySlug.has(bl.fromSlug) && bl.fromSlug !== post.slug) neighbourIds.add(bl.fromSlug);
    }

    const neighbourArr = Array.from(neighbourIds).map((id) => ({
      id,
      post: bySlug.get(id)!,
    }));
    // Centre post stays at z=0; neighbours get a small random z so
    // the Y-axis rotation has real depth to work with.
    const baseNodes: SimNode[] = [
      { id: post.slug, title: post.title, degree: neighbourArr.length, z: 0 },
      ...neighbourArr.map((n) => ({
        id: n.id,
        title: n.post.title,
        degree: 1,
        z: (Math.random() - 0.5) * 80,
      })),
    ];
    const baseEdges: SimEdge[] = neighbourArr.map((n) => ({
      source: post.slug,
      target: n.id,
      weight: 1,
    }));
    return { nodes: baseNodes, edges: baseEdges };
  }, [post, backlinks]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const svgEl = svgRef.current;
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    let sim: d3.Simulation<SimNode, SimEdge> | null = null;
    let rafId: number | null = null;

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
      const g = svg.append('g');

      const simNodes: SimNode[] = nodes.map((n) => ({
        ...n,
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height / 2 + (Math.random() - 0.5) * 40,
      }));
      const simEdges: SimEdge[] = edges.map((e) => ({ ...e }));

      const link = g
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(simEdges)
        .join('line')
        .attr('class', 'graph-link')
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 0.8)
        .attr('stroke-opacity', 0.45);

      const node = g
        .append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, SimNode>('g')
        .data(simNodes, (d) => d.id)
        .join('g')
        .attr('class', 'graph-node')
        .attr('data-id', (d) => d.id)
        .style('cursor', 'pointer');

      const baseR = 3.5;
      const maxR = 9;

      node
        .append('circle')
        .attr('r', (d) => (d.id === post.slug
          ? baseR + maxR * 0.6
          : baseR + Math.min(maxR, Math.sqrt(d.degree) * 1.4)))
        .attr('fill', (d) => (d.id === post.slug
          ? 'var(--color-primary, #6366f1)'
          : colorForTag(d.id)))
        .attr('stroke', 'var(--color-bg-elevated)')
        .attr('stroke-width', 1.4);

      // Show a tiny label on every node.
      node
        .append('text')
        .text((d) => {
          const t = d.title;
          const max = d.id === post.slug ? 6 : 4;
          return t.length > max ? t.slice(0, max) + '…' : t;
        })
        .attr('x', (d) => (d.id === post.slug ? 12 : 9))
        .attr('y', 3)
        .attr('font-size', (d) => (d.id === post.slug ? 9 : 8))
        .attr('font-weight', (d) => (d.id === post.slug ? 600 : 500))
        .attr('fill', 'currentColor')
        .attr('class', 'graph-label')
        .attr('textLength', (d) => Math.min(d.id === post.slug ? 64 : 40, d.title.length * 7))
        .attr('lengthAdjust', 'spacingAndGlyphs');

      // Click → navigate to the post.
      const onClick = (e: MouseEvent) => {
        let el = e.target as Element | null;
        while (el && el !== svgEl) {
          if (el.classList && el.classList.contains('graph-node')) {
            const id = (el as HTMLElement).getAttribute('data-id');
            if (id && id !== post.slug) {
              e.stopPropagation();
              e.preventDefault();
              window.location.hash = `#/blog/${encodeURIComponent(id)}`;
            }
            return;
          }
          el = el.parentElement;
        }
      };
      const onMouseOver = (e: MouseEvent) => {
        let el = e.target as Element | null;
        while (el && el !== svgEl) {
          if (el.classList && el.classList.contains('graph-node')) {
            const id = (el as HTMLElement).getAttribute('data-id');
            if (!id) return;
            const neighbors = new Set([id]);
            simEdges.forEach((edge) => {
              const s = typeof edge.source === 'string' ? edge.source : (edge.source as SimNode).id;
              const t = typeof edge.target === 'string' ? edge.target : (edge.target as SimNode).id;
              if (s === id) neighbors.add(t);
              if (t === id) neighbors.add(s);
            });
            node
              .classed('dim', (d) => !neighbors.has(d.id))
              .classed('active', (d) => d.id === id)
              .classed('neighbor', (d) => d.id !== id && neighbors.has(d.id));
            link.classed('dim', (edge) => {
              const s = typeof edge.source === 'string' ? edge.source : (edge.source as SimNode).id;
              const t = typeof edge.target === 'string' ? edge.target : (edge.target as SimNode).id;
              return s !== id && t !== id;
            });
            return;
          }
          el = el.parentElement;
        }
      };
      const onMouseOut = (e: MouseEvent) => {
        const related = e.relatedTarget as Element | null;
        if (!related || !svgEl.contains(related)) {
          node.classed('dim', false).classed('active', false).classed('neighbor', false);
          link.classed('dim', false);
          return;
        }
        if (!related.closest('.graph-node')) {
          node.classed('dim', false).classed('active', false).classed('neighbor', false);
          link.classed('dim', false);
        }
      };
      svgEl.addEventListener('click', onClick);
      svgEl.addEventListener('pointerover', onMouseOver);
      svgEl.addEventListener('pointerout', onMouseOut);

      sim = d3
        .forceSimulation<SimNode>(simNodes)
        .force(
          'link',
          d3
            .forceLink<SimNode, SimEdge>(simEdges)
            .id((d) => d.id)
            .distance(46)
            .strength(0.6),
        )
        .force('charge', d3.forceManyBody().strength(-180))
        .alpha(0.7).alphaDecay(0.05)
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(14))
        .on('tick', () => {
          // Pin the centre so it doesn't drift.
          const center = simNodes.find((n) => n.id === post.slug);
          if (center) {
            center.fx = width / 2;
            center.fy = height / 2;
          }
          // Pre-rotation phase: paint in 2D.
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
          if (reduceMotion) return;
          const cx = width / 2;
          const cy = height / 2;
          const focal = 220;
          const zMax = 100;
          let theta = 0;
          let last = performance.now();
          const speed = (Math.PI * 2) / 45000; // 45s per turn
          const tickMs = 1000 / 30;
          const loop = (now: number) => {
            if (now - last >= tickMs) {
              last = now;
              theta += speed * (now - last + tickMs);
              if (theta > Math.PI * 2) theta -= Math.PI * 2;
              node.each(function (d: any) {
                const dx = d.x - cx;
                const z = d.z ?? 0;
                const cos = Math.cos(theta);
                const sin = Math.sin(theta);
                const xScreen = cx + dx * cos + z * sin;
                const z3d = -dx * sin + z * cos;
                const denom = Math.max(60, focal - z3d);
                const scale = focal / denom;
                const norm = Math.max(-1, Math.min(1, z3d / zMax));
                const opacity = 0.35 + 0.65 * ((norm + 1) / 2);
                d3.select(this)
                  .attr('transform', `translate(${xScreen},${d.y}) scale(${scale})`)
                  .attr('opacity', opacity);
              });
              link.each(function (d: any) {
                const a = projectY(d.source, theta, cx, cy, focal, zMax);
                const b = projectY(d.target, theta, cx, cy, focal, zMax);
                d3.select(this)
                  .attr('x1', a.x).attr('y1', a.y)
                  .attr('x2', b.x).attr('y2', b.y)
                  .attr('stroke-opacity', Math.min(a.opacity, b.opacity) * 0.45);
              });
            }
            rafId = requestAnimationFrame(loop);
          };
          rafId = requestAnimationFrame(loop);
        });

      setStats({ nodes: simNodes.length, edges: simEdges.length });

      cleanup = () => {
        svgEl.removeEventListener('click', onClick);
        svgEl.removeEventListener('pointerover', onMouseOver);
        svgEl.removeEventListener('pointerout', onMouseOut);
        if (rafId != null) cancelAnimationFrame(rafId);
        sim?.stop();
      };
    }

    requestAnimationFrame(start);
    return () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [nodes, edges, post.slug]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-fg">
          <Network className="size-4 text-primary" />
          <h2 className="text-base font-semibold">关联图</h2>
        </div>
        <Link
          to={`/graph?scope=${encodeURIComponent(
            post.sourcePath.split('/').slice(0, -1).join('/'),
          )}`}
          className="inline-flex items-center gap-0.5 text-xs text-fg-muted hover:text-primary"
        >
          查看完整图谱 <ChevronRight className="size-3" />
        </Link>
      </div>
      <div
        ref={containerRef}
        className="graph-svg relative px-2"
        style={{ minHeight: '220px' }}
      >
        <svg
          ref={svgRef}
          className="block h-[220px] w-full text-fg-muted"
        />
        <div className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-[9px] text-fg-muted/60">
          {stats.nodes} 个节点 · {stats.edges} 条 wiki link
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Public export: the two-column block
// ============================================================================

export function PostContextNav({
  post,
  backlinks,
}: {
  post: Post;
  backlinks: { fromSlug: string; fromTitle: string }[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <LocationTree post={post} />
      <RelatedGraph post={post} backlinks={backlinks} />
    </section>
  );
}
