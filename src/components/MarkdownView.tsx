import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import type { Element } from 'hast';
import { remarkWikiLink } from '@/lib/remark-wikilink';
import { remarkCallout } from '@/lib/remark-callout';
import { WikiLink } from './WikiLink';
import { Callout } from './Callout';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

interface MarkdownViewProps {
  body: string;
  className?: string;
}

function safeUrlTransform(url: string): string | undefined {
  if (!url) return url;
  if (url.startsWith('wikilink:')) return url;
  if (
    url.startsWith('#') ||
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../')
  ) {
    return url;
  }
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  return undefined;
}

const schema: typeof defaultSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), 'wikilink'],
  },
  clobberPrefix: 'user-content-',
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['className', 'wiki-link', 'wiki-link--embed', 'wiki-link--broken'],
      'data-wikilink',
      'data-wiki-slug',
      'data-wiki-heading',
      'data-wiki-alias',
      'data-wiki-embed',
      'data-wiki-target',
    ],
    p: [
      ...(defaultSchema.attributes?.p ?? []),
      'data-callout',
      [
        'className',
        'callout',
        'callout-note',
        'callout-info',
        'callout-tip',
        'callout-warning',
        'callout-danger',
        'callout-quote',
        'callout-example',
        'my-6',
      ],
    ],
    blockquote: [
      ...(defaultSchema.attributes?.blockquote ?? []),
      'data-callout',
      [
        'className',
        'callout',
        'callout-note',
        'callout-info',
        'callout-tip',
        'callout-warning',
        'callout-danger',
        'callout-quote',
        'callout-example',
        'my-6',
      ],
    ],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'data*'],
  },
};

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  node?: Element;
  children?: React.ReactNode;
};
function renderAnchor(props: AnchorProps) {
  const { href, children, ...rest } = props;
  if (typeof href === 'string' && href.startsWith('wikilink:')) {
    const slug = href.slice('wikilink:'.length);
    const ds = (rest as Record<string, unknown>)['data-wiki-slug'] as string | undefined;
    const dh = (rest as Record<string, unknown>)['data-wiki-heading'] as string | undefined;
    const da = (rest as Record<string, unknown>)['data-wiki-alias'] as string | undefined;
    const de = (rest as Record<string, unknown>)['data-wiki-embed'] as string | undefined;
    const dt = (rest as Record<string, unknown>)['data-wiki-target'] as string | undefined;
    return (
      <WikiLink
        slug={ds ?? slug}
        heading={dh || null}
        alias={da || null}
        embed={de === 'true'}
        target={dt ?? slug}
      >
        {children}
      </WikiLink>
    );
  }
  const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (typeof href === 'string' && href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement> & {
  node?: Element;
  children?: React.ReactNode;
};
function renderBlockquote(props: BlockquoteProps) {
  // eslint-disable-next-line no-console
  // (debug log removed)
  const calloutType = props.node?.properties?.dataCallout as string | undefined;
  if (calloutType) {
    return <Callout type={calloutType}>{props.children}</Callout>;
  }
  const { node: _node, children, ...rest } = props;
  void _node;
  return <blockquote {...rest}>{children}</blockquote>;
}

const components: Components = {
  a: renderAnchor,
  blockquote: renderBlockquote,
};

export function MarkdownView({ body, className }: MarkdownViewProps) {
  return (
    <article
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none',
        'prose-headings:scroll-mt-20 prose-headings:font-semibold',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-zinc-950 prose-pre:text-zinc-100',
        'prose-img:rounded-lg prose-img:border',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCallout, remarkWikiLink]}
        rehypePlugins={[rehypeRaw, rehypeSlug, [rehypeSanitize, schema]]}
        urlTransform={safeUrlTransform}
        components={components}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
