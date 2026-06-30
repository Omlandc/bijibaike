/**
 * JSON-LD builders for the most common schema.org types.
 *
 * Usage:
 *   const org = jsonld.organization({ name: 'Acme', url: 'https://acme.com' });
 *   <SEOHead jsonLd={[org, jsonld.article({ ... })]} />
 *
 * Each builder returns a plain object that you can spread, extend, or
 * pass directly to JSON.stringify. Nothing is schema-validated at runtime —
 * treat them as typed shorthand for what you'd write by hand.
 */

export type JsonLdObject = Record<string, unknown>;

type BaseThing = {
  '@context'?: 'https://schema.org';
  '@type': string;
  '@id'?: string;
  name?: string;
  url?: string;
  image?: string | string[];
  description?: string;
  sameAs?: string[];
  [key: string]: unknown;
}

export const jsonld = {
  /** A schema.org Organization — site-wide identity. */
  organization(input: {
    name: string;
    url?: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
    id?: string;
  }): JsonLdObject {
    const thing: BaseThing = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: input.name,
    };
    if (input.id) thing['@id'] = input.id;
    if (input.url) thing.url = input.url;
    if (input.logo) thing.image = input.logo;
    if (input.description) thing.description = input.description;
    if (input.sameAs) thing.sameAs = input.sameAs;
    return thing;
  },

  /** A schema.org WebSite — site identity with search action. */
  website(input: {
    name: string;
    url: string;
    description?: string;
    inLanguage?: string;
    /** Set to true to expose sitelinks search box. */
    enableSearch?: boolean;
  }): JsonLdObject {
    const thing: BaseThing & {
      potentialAction?: JsonLdObject;
    } = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: input.name,
      url: input.url,
    };
    if (input.description) thing.description = input.description;
    if (input.inLanguage) thing.inLanguage = input.inLanguage;
    if (input.enableSearch) {
      thing.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${input.url.replace(/\/$/, '')}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      };
    }
    return thing;
  },

  /** A schema.org Article (use for blog posts, news, etc). */
  article(input: {
    headline: string;
    url: string;
    image?: string | string[];
    datePublished: string;
    dateModified?: string;
    author?: string | { name: string; url?: string };
    publisher?: { name: string; logo?: string };
    description?: string;
    keywords?: string[];
    articleSection?: string;
    inLanguage?: string;
  }): JsonLdObject {
    const author =
      typeof input.author === 'string'
        ? { '@type': 'Person', name: input.author }
        : input.author
          ? { '@type': 'Person', ...input.author }
          : undefined;
    const publisher = input.publisher
      ? {
          '@type': 'Organization',
          name: input.publisher.name,
          ...(input.publisher.logo ? { logo: input.publisher.logo } : {}),
        }
      : undefined;
    const thing: JsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: input.headline,
      url: input.url,
      datePublished: input.datePublished,
    };
    if (input.image) thing.image = input.image;
    if (input.dateModified) thing.dateModified = input.dateModified;
    if (author) thing.author = author;
    if (publisher) thing.publisher = publisher;
    if (input.description) thing.description = input.description;
    if (input.keywords) thing.keywords = input.keywords.join(', ');
    if (input.articleSection) thing.articleSection = input.articleSection;
    if (input.inLanguage) thing.inLanguage = input.inLanguage;
    return thing;
  },

  /** A BreadcrumbList for navigation breadcrumbs. */
  breadcrumb(input: { items: Array<{ name: string; url: string }> }): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  },

  /** A WebPage (generic). */
  webpage(input: {
    name: string;
    url: string;
    description?: string;
    inLanguage?: string;
    isPartOf?: string; // @id of the parent WebSite
  }): JsonLdObject {
    const thing: JsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: input.name,
      url: input.url,
    };
    if (input.description) thing.description = input.description;
    if (input.inLanguage) thing.inLanguage = input.inLanguage;
    if (input.isPartOf) thing.isPartOf = { '@id': input.isPartOf };
    return thing;
  },

  /** A Person (author profile). */
  person(input: { name: string; url?: string; image?: string; sameAs?: string[] }): JsonLdObject {
    const thing: BaseThing = { '@context': 'https://schema.org', '@type': 'Person', name: input.name };
    if (input.url) thing.url = input.url;
    if (input.image) thing.image = input.image;
    if (input.sameAs) thing.sameAs = input.sameAs;
    return thing;
  },
};