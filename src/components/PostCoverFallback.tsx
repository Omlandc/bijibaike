import { FileText } from 'lucide-react';
import type { Post } from '@/lib/content';

/** Stable hue (0-359) for a given seed string — same post always
 *  renders the same fallback gradient. */
function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** A card-sized cover placeholder used when the post has no image.
 *  Computes a stable hue from the post slug and builds a 135deg
 *  pastel gradient directly in JS so it works in every browser
 *  (no reliance on hsl(var(--hue) ...) which has shaky support).
 *  The two gradient stops are picked so the second is ~35° further
 *  around the wheel for a soft "two-tone" look. */
export function PostCoverFallback({
  post,
  aspect = 'aspect-[4/3] sm:aspect-square',
  className = '',
  showTag = false,
}: {
  post: Post;
  aspect?: string;
  className?: string;
  showTag?: boolean;
}) {
  const hue = hueFor(post.slug || post.title);
  // Pastel: light/dark adaptive — we read the active theme at render
  // time so it stays correct after a theme switch.
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark'));
  const sat = isDark ? 55 : 70;
  const light1 = isDark ? 26 : 88;
  const light2 = isDark ? 18 : 80;
  const hue2 = (hue + 35) % 360;
  const background = `linear-gradient(135deg, hsl(${hue} ${sat}% ${light1}%) 0%, hsl(${hue2} ${sat}% ${light2}%) 100%)`;
  return (
    <div
      className={`post-cover-fallback relative flex ${aspect} w-full items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ background }}
      aria-hidden
    >
      <FileText
        className="size-12 text-fg/30 mix-blend-overlay"
        strokeWidth={1.2}
      />
      {showTag && post.tags[0] ? (
        <span className="absolute bottom-3 left-3 rounded-full border border-fg/15 bg-white/35 px-2.5 py-1 text-[10px] font-medium text-fg/80 backdrop-blur-sm">
          {post.tags[0]}
        </span>
      ) : null}
    </div>
  );
}
