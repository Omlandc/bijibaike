import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Network, Search, X, Eye, EyeOff, RotateCcw, Maximize2 } from 'lucide-react';
import { getAllPosts, getAllTags } from '@/lib/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface SimNode {
  id: string;
  title: string;
  tags: string[];
  level: string; // primary tag, used for color
  degree: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

interface SimEdge {
  source: SimNode | string;
  target: SimNode | string;
  weight: number;
}

// Color palette keyed by the post's primary tag. Falls back to a
// deterministic hash color so even untagged posts get a stable hue.
const PALETTE = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#a855f7', // purple
];

function colorForTag(tag: string | undefined, title: string): string {
  if (tag) {
    // hash tag to a palette index
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length]!;
  }
  // fall back to title hash
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 17 + title.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

export default function Graph() {
  const { t } = useTranslation();
  const posts = getAllPosts();
  const allTags = getAllTags();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [query, setQuery] = useState('');
  const [showOrphans, setShowOrphans] = useState(true); // default ON: a fresh vault usually has no links, hiding orphans would give an empty graph
  const [stats, setStats] = useState({ nodes: 0, edges: 0, total: posts.length });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Build the graph data from posts.
  const data = useMemo(() => {
    const validSlugs = new Set(posts.map((p) => p.slug));
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
      for (const target of p.links) {
        if (!validSlugs.has(target) || target === p.slug) continue;
        const key = [p.slug, target].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ source: p.slug, target, weight: 1 });
      }
    }
    // degree counts
    for (const e of edges) {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      const sn = nodes.find((n) => n.id === s);
      const tn = nodes.find((n) => n.id === t);
      if (sn) sn.degree++;
      if (tn) tn.degree++;
    }
    return { nodes, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Filter orphans if needed (use a copy so we keep the full data set)
      const visibleNodes = showOrphans
        ? data.nodes
        : data.nodes.filter((n) => n.degree > 0);
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const visibleEdges = data.edges.filter((e) => {
        const s = typeof e.source === 'string' ? e.source : e.source.id;
        const t = typeof e.target === 'string' ? e.target : e.target.id;
        return visibleNodeIds.has(s) && visibleNodeIds.has(t);
      });

      setStats({ nodes: visibleNodes.length, edges: visibleEdges.length, total: data.nodes.length });

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      // Defs (glow, arrowhead)
      const defs = svg.append('defs');
      defs
        .append('filter')
        .attr('id', 'node-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'blur');
      const merge = defs
        .append('filter')
        .attr('id', 'node-glow-merged')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      merge.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
      merge
        .append('feMerge')
        .selectAll('feMergeNode')
        .data(['blur', 'SourceGraphic'])
        .join('feMergeNode')
        .attr('in', (d) => d as string);

      const g = svg.append('g');

      // Zoom
      const zoom = (zoomRef.current = d3
        .zoom<SVGSVGElement, unknown>())
        .scaleExtent([0.2, 5])
        // Allow wheel + two-finger pinch; the zoom filter only blocks
        // button-clicks on nodes (mousedown). Touch is handled by d3
        // natively: single finger = pan, two fingers = pinch.
        .filter((event) => {
          const t = event.target as Element | null;
          if (t && t.closest && t.closest('.graph-node')) return false;
          return !event.button || event.button === 0;
        })
        .on('zoom', (e) => {
          g.attr('transform', e.transform.toString());
          // Show / hide labels based on zoom level. Below scale=1 the
          // labels overlap on small screens; above 1.4 they fit.
          const k = e.transform.k;
          g.selectAll('.graph-node text')
            .attr('display', k >= 1.05 ? null : 'none');
        });
      svg.call(zoom);
      // Disable the built-in dblclick-to-zoom — we use dblclick to
      // navigate, and the sim already settles naturally.
      svg.on('dblclick.zoom', null);

      // Sim
      const simNodes: SimNode[] = visibleNodes.map((n) => {
        // Seed positions around the center so the initial frame isn't
        // a single cluster at (0, 0) before the simulation kicks in.
        const seedX = width / 2 + (Math.random() - 0.5) * 200;
        const seedY = height / 2 + (Math.random() - 0.5) * 200;
        return { ...n, x: seedX, y: seedY };
      });
      const simEdges: SimEdge[] = visibleEdges.map((e) => ({
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
        .attr('stroke-width', 1)
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

      // Smaller nodes on small screens so 4–6 of them fit in 320px width.
      const isCompact = width < 480;
      const baseR = isCompact ? 4 : 5;
      const maxR = isCompact ? 12 : 18;
      const labelMax = isCompact ? 80 : 160;

      node
        .append('circle')
        .attr('r', (d) => baseR + Math.min(maxR, Math.sqrt(d.degree) * (isCompact ? 2 : 3)))
        .attr('fill', (d) => colorForTag(d.level, d.title))
        .attr('stroke', 'var(--color-bg-elevated)')
        .attr('stroke-width', 2);

      node
        .append('text')
        .text((d) => {
          // Truncate long titles so they don't run off the right edge.
          const t = d.title;
          return t.length > (isCompact ? 8 : 14) ? t.slice(0, (isCompact ? 8 : 14)) + '…' : t;
        })
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', isCompact ? 10 : 11)
        .attr('fill', 'currentColor')
        .attr('class', 'graph-label')
        // SVG text doesn't get a hard cap; we use a CSS width constraint
        // via the .graph-label class so it ellipsises cleanly.
        .attr('textLength', (d) => Math.min(labelMax, d.title.length * (isCompact ? 7 : 8)))
        .attr('lengthAdjust', 'spacingAndGlyphs');

      const sim = d3
        .forceSimulation<SimNode>(simNodes)
        .force(
          'link',
          d3
            .forceLink<SimNode, SimEdge>(simEdges)
            .id((d) => d.id)
            .distance(isCompact ? 50 : 80)
            .strength(0.5),
        )
        .force('charge', d3.forceManyBody().strength(isCompact ? -200 : -380))
        .alpha(0.6).alphaDecay(0.02)
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(isCompact ? 28 : 40))
        .on('tick', () => {
          link
            .attr('x1', (d) => (d.source as SimNode).x!)
            .attr('y1', (d) => (d.source as SimNode).y!)
            .attr('x2', (d) => (d.target as SimNode).x!)
            .attr('y2', (d) => (d.target as SimNode).y!);
          node.attr('transform', (d) => `translate(${d.x},${d.y})`);
        });
      simRef.current = sim;

      // Find node by event target
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

      // Click handling
      const DBLCLICK_MS = 500;
      const DRAG_THRESHOLD = 4;
      let mdId: string | null = null;
      let mdTimer: ReturnType<typeof setTimeout> | null = null;
      let dragStart: { x: number; y: number } | null = null;
      let dragNode: SimNode | null = null;
      let isDragging = false;

      function screenToGraph(clientX: number, clientY: number): { x: number; y: number } | null {
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = g.node()?.getScreenCTM();
        if (!ctm) return null;
        const local = pt.matrixTransform(ctm.inverse());
        return { x: local.x, y: local.y };
      }

      const onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const id = findNodeId(e.target);
        if (!id) {
          mdId = null;
          if (mdTimer) {
            clearTimeout(mdTimer);
            mdTimer = null;
          }
          dragStart = null;
          dragNode = null;
          isDragging = false;
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        const nodeObj = simNodes.find((n) => n.id === id) || null;
        dragNode = nodeObj;
        dragStart = { x: e.clientX, y: e.clientY };
        isDragging = false;
        if (mdTimer) clearTimeout(mdTimer);
        if (mdId === id) {
          // double-click on same node
          mdId = null;
          mdTimer = null;
          // navigate
          window.location.hash = `#/blog/${id}`;
        } else {
          mdId = id;
          highlight(id);
          mdTimer = setTimeout(() => {
            mdId = null;
            mdTimer = null;
          }, DBLCLICK_MS);
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!dragStart || !dragNode) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        if (!isDragging) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          isDragging = true;
          if (mdTimer) {
            clearTimeout(mdTimer);
            mdTimer = null;
          }
          mdId = null;
          dragNode.fx = dragNode.x;
          dragNode.fy = dragNode.y;
          sim.alphaTarget(0.3).restart();
        }
        const local = screenToGraph(e.clientX, e.clientY);
        if (local) {
          dragNode.fx = local.x;
          dragNode.fy = local.y;
        }
      };

      const onMouseUp = () => {
        if (isDragging && dragNode && sim) {
          dragNode.fx = null;
          dragNode.fy = null;
          sim.alphaTarget(0);
        }
        isDragging = false;
        dragStart = null;
        dragNode = null;
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

      svgEl.addEventListener('mousedown', onMouseDown);
      svgEl.addEventListener('mouseover', onMouseOver);
      svgEl.addEventListener('mouseout', onMouseOut);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      cleanup = () => {
        svgEl.removeEventListener('mousedown', onMouseDown);
        svgEl.removeEventListener('mouseover', onMouseOver);
        svgEl.removeEventListener('mouseout', onMouseOut);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (mdTimer) clearTimeout(mdTimer);
        isDragging = false;
        dragStart = null;
        dragNode = null;
      };
    }

    requestAnimationFrame(start);

    return () => {
      cancelled = true;
      simRef.current?.stop();
      simRef.current = null;
      if (cleanup) cleanup();
    };
  }, [data, showOrphans]);

  // Live search: focus a node + its neighbors
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (!query) {
      svg
        .selectAll('.graph-node')
        .classed('dim', false)
        .classed('active', false)
        .classed('neighbor', false);
      svg.selectAll('.graph-link').classed('dim', false);
      return;
    }
    const q = query.toLowerCase().trim();
    if (!q) return;
    const found = data.nodes.find(
      (n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q),
    );
    if (!found) {
      // dim all
      svg.selectAll('.graph-node').classed('dim', true);
      svg.selectAll('.graph-link').classed('dim', true);
      return;
    }
    const neighbors = new Set([found.id]);
    data.edges.forEach((e) => {
      const s = typeof e.source === 'string' ? e.source : (e.source as SimNode).id;
      const t = typeof e.target === 'string' ? e.target : (e.target as SimNode).id;
      if (s === found.id) neighbors.add(t);
      if (t === found.id) neighbors.add(s);
    });
    svg
      .selectAll<SVGGElement, SimNode>('.graph-node')
      .classed('dim', (d) => !neighbors.has(d.id))
      .classed('active', (d) => d.id === found.id)
      .classed('neighbor', (d) => d.id !== found.id && neighbors.has(d.id));
    svg
      .selectAll<SVGLineElement, SimEdge>('.graph-link')
      .classed('dim', (d) => {
        const s = typeof d.source === 'string' ? d.source : (d.source as SimNode).id;
        const t = typeof d.target === 'string' ? d.target : (d.target as SimNode).id;
        return s !== found.id && t !== found.id;
      });
  }, [query, data]);

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomRef.current.transform as never, d3.zoomIdentity);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="size-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-fg">{t('graph.title')}</h1>
          </div>
          <p className="text-fg-muted">
            {stats.nodes} 节点 · {stats.edges} 条 wikilink 引用 · 节点大小 = 引用度 ·
            颜色 = 主标签
            {stats.total > stats.nodes ? ` · ${stats.total - stats.nodes} 个孤立节点已隐藏` : ''}
          </p>
        </div>
        {allTags.length > 0 ? (
          <div className="flex max-w-md flex-wrap items-center gap-1.5">
            {allTags.slice(0, 8).map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-1 text-xs"
                title={`${t.count} 篇`}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: colorForTag(t.name, t.name) }}
                />
                <span className="text-fg-muted">#{t.name}</span>
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-bg-elevated/50 px-3 py-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('graph.search')}
              className="h-8 pl-8 text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-fg-muted hover:bg-bg-subtle"
                aria-label="清除搜索"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOrphans((o) => !o)}
            className="size-8 sm:hidden"
            title={showOrphans ? '隐藏无连接的孤立节点' : '显示所有节点(包括孤立的)'}
          >
            {showOrphans ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOrphans((o) => !o)}
            className="hidden text-xs sm:inline-flex"
            title={showOrphans ? '隐藏无连接的孤立节点' : '显示所有节点(包括孤立的)'}
          >
            {showOrphans ? (
              <EyeOff className="mr-1 size-3.5" />
            ) : (
              <Eye className="mr-1 size-3.5" />
            )}
            {showOrphans ? t('graph.hideOrphans') : t('graph.showOrphans')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            title={t('graph.reset')}
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('graph.exitFullscreen') : t('graph.fullscreen')}
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>

        <CardContent
          ref={containerRef}
          className={cn(
            'graph-container relative h-[70vh] min-h-[420px] overflow-hidden p-0 text-fg-muted sm:h-[640px]',
            isFullscreen && 'fixed inset-0 z-50 h-screen rounded-none border-0',
          )}
        >
          <svg ref={svgRef} className="graph-svg absolute inset-0 h-full w-full" />

          <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-md border border-border bg-bg-elevated/85 px-3 py-1.5 text-center text-xs text-fg-muted backdrop-blur">
            <span className="hidden sm:inline">
              拖动节点 · 背景平移 · 滚轮/双指缩放 · 单击高亮 · 双击打开
            </span>
            <span className="sm:hidden">
              拖动平移 · 双指缩放 · 单击高亮 · 双击打开
            </span>
          </div>

          <div className="pointer-events-none absolute right-3 bottom-3 hidden rounded-md border border-border bg-bg-elevated/85 px-2 py-1 text-[10px] text-fg-muted backdrop-blur sm:block">
            <kbd className="rounded border border-border bg-bg px-1 font-mono text-[10px]">D3.js</kbd>{' '}
            force-directed
          </div>
        </CardContent>
      </Card>

      <Card className="hidden sm:block">
        <CardContent className="space-y-2 p-4 text-sm text-fg-muted">
          <p>
            💡 在文章中用 <code className="rounded bg-bg-subtle px-1 text-fg">[[双链]]</code>{' '}
            引用其他文章,它们就会出现在这张图上。
          </p>
          <p className="text-xs">
            每个节点的主标签决定颜色;节点大小按引用度(出度+入度)的平方根缩放;图会根据物理模拟自动布局,可以拖动来固定某个节点。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

