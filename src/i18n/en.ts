/**
 * English translations.
 *
 * Add a key here and in zh.ts (and any other languages) and the site
 * renders it. Missing keys fall back to the Chinese version so partial
 * translations never show empty strings.
 */

import type { TranslationKey } from './zh';

export const en: Partial<Record<TranslationKey, string>> = {
  // Navigation
  'nav.home': 'Home',
  'nav.posts': 'Posts',
  'nav.topics': 'Topics',
  'nav.tags': 'Tags',
  'nav.graph': 'Graph',
  'nav.resources': 'Resources',
  'nav.changelog': 'Changelog',
  'nav.pricing': 'Pricing',

  // Site meta
  'site.search': 'Search',
  'site.searchPlaceholder': 'Search posts, tags...',
  'site.postsAndTags': '{posts} posts · {tags} tags',
  'site.toggleTheme': 'Toggle theme',

  // Theme names (shown in dropdown)
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.sepia': 'Sepia',
  'theme.cyberpunk': 'Cyber',

  // Language switcher
  'lang.switch': 'Language',
  'lang.zh': '中文',
  'lang.en': 'English',

  // Mobile menu
  'mobileMenu.menu': 'Menu',
  'mobileMenu.open': 'Open menu',
  'mobileMenu.close': 'Close menu',

  // Home
  'home.heading': 'Write once, blog everywhere',
  'home.browseAll': 'Browse all posts',
  'home.viewGraph': 'View graph',
  'home.stats': '{posts} posts · {tags} tags · {links} wiki links',
  'home.searchPosts': 'Search posts...',
  'home.filter.latest': 'Latest',
  'home.filter.popular': 'Popular',
  'home.filter.all': 'All',
  'home.featured': 'Featured',

  // Blog list
  'blog.title': 'All posts',
  'blog.subtitle': 'Browse every Obsidian-style post',
  'blog.empty': 'No posts yet — add a .md file in your vault.',
  'blog.noMatch': 'No posts match the current filters. Try clearing or adjusting them.',

  // Filter bar
  'filter.postsUnit': 'posts',
  'filter.clearAll': 'Clear all',
  'filter.activeLabel': 'Active:',
  'filter.sortLabel': 'Sort',
  'filter.sortNewest': 'Newest first',
  'filter.sortOldest': 'Oldest first',
  'filter.sortUpdated': 'Recently updated',
  'filter.sortMostLinked': 'Most linked',
  'filter.sortLongest': 'Longest read',
  'filter.sortTitle': 'Title A–Z',
  'filter.tagsLabel': 'Tags',
  'filter.tagPlaceholder': 'Pick tags (multi = AND)',
  'filter.yearLabel': 'Year',
  'filter.yearPlaceholder': 'Pick years (multi = OR)',
  'filter.themeLabel': 'Body theme',
  'filter.themePlaceholder': 'Pick themes (multi = OR)',
  'filter.themeDefault': '(default)',
  'filter.pinnedOnly': 'Pinned only',
  'filter.pinnedOnlyHint': 'Only show posts with frontmatter `pinned: true`',

  // Post
  'post.backToList': 'Back to list',
  'post.created': 'Created',
  'post.updated': 'Updated',
  'post.minutes': 'min',
  'post.tagsCount': '{count} tags',
  'post.toc': 'Outline',
  'post.tocMobile': 'Outline ({count})',
  'post.readingProgress': 'Reading progress',
  'post.backlinks': 'Referenced by ({count})',
  'post.prev': 'Previous',
  'post.next': 'Next',
  'post.copyLink': 'Copy link',
  'post.linkCopied': 'Copied',
  'contentTheme.pickerLabel': 'Reading theme',
  'contentTheme.toggleHint': 'Theme only affects your device; nothing is saved on the server',

  // Post properties panel
  'properties.title': 'Properties',
  'properties.created': 'Created',
  'properties.updated': 'Updated',
  'properties.author': 'Author',
  'properties.cover': 'Cover',
  'properties.theme': 'Body theme',
  'properties.themeHint': 'Read from frontmatter contentTheme; you can override it with the picker below',
  'properties.tags': 'Tags',
  'properties.custom': 'Custom',
  'properties.pinned': 'Pinned',
  'properties.draft': 'Draft',

  // Topics
  'topics.title': 'Topics',
  'topics.subtitle': 'An Obsidian-folder-shaped portal: each top-level directory is a {pillar}, broken down into {cluster}s.',
  'topics.pillar': 'Pillar',
  'topics.cluster': 'Cluster',
  'topics.empty': 'No topics yet — create a sub-directory in your vault.',
  'topics.posts': '{count} posts',
  'topics.browse': 'Browse',
  'topics.postsInCluster': 'Posts in {cluster}',

  // Tags
  'tags.title': 'Tags',
  'tags.subtitle': 'Browse posts by tag',
  'tags.allTag': 'All',
  'tags.empty': 'No tags yet',
  'tags.countOne': '{count} post',
  'tags.countMany': '{count} posts',
  'tags.postsWith': 'Posts tagged "{tag}" ({count})',

  // Graph
  'graph.title': 'Graph',
  'graph.tagFilter': 'Tag filter',
  'graph.tagFilterAll': 'All tags',
  'graph.tagFilterClear': 'Clear tag filter',
  'graph.tagMatched': 'matched {n} nodes',
  'graph.subtitle': 'Visualize wiki-link relationships between posts',
  'graph.search': 'Search nodes...',
  'graph.fullscreen': 'Fullscreen',
  'graph.exitFullscreen': 'Exit fullscreen',
  'graph.reset': 'Reset view',
  'graph.hideOrphans': 'Hide orphans',
  'graph.showOrphans': 'Show orphans',
  'graph.empty': 'No wiki-links yet — add [[double-bracket]] links to connect posts.',
  'graph.openPost': 'Open post (double-click)',
  'graph.scopeAll': 'All vault',
  'graph.scopeLabel': 'Lock to folder',
  'graph.scopeBreadcrumb': 'Scope:',
  'graph.scopeClear': 'All topics',
  'graph.scopeBackHint': 'Back to global graph (clear scope filter)',
  'graph.crossBoundary': '{n} cross-scope links hidden',

  // Resources
  'resources.title': 'Resources',
  'resources.subtitle': 'Tools, references, and external links I use for writing, note-taking, and Obsidian.',
  'resources.configNote': 'Configured in',
  'resources.configNoteOf': 'under the',
  'resources.configNoteSection': 'section.',
  'resources.empty': 'No resources yet. Open {file} in your vault root and add the {section} section:',
  'resources.backHome': 'Back to home',

  // About / Privacy / Contact
  'about.title': 'About',
  'privacy.title': 'Privacy',
  'contact.title': 'Contact',

  // Cookie consent
  'cookie.title': 'Cookies & advertising',
  'cookie.description': 'We use essential cookies to remember your preferences. With your consent, Google AdSense will set advertising cookies for personalized content. See our {policy}.',
  'cookie.essential': 'Essential only',
  'cookie.acceptAll': 'Accept all',
  'cookie.policy': 'privacy policy',
  'cookie.settingsButton': 'Cookie preferences',
  'cookie.settingsHint': 'By default we do not show the cookie banner — new visitors are treated as "essential only". Click this button if you want to change your preference (e.g. enable personalized ads).',

  // 404 / misc
  'notFound.title': 'Page not found',
  'notFound.goHome': 'Go home',
  'loading': 'Loading...',

  // Changelog
  'changelog.title': 'Changelog',
  'changelog.subtitle': 'Every update and improvement to this site',
  'changelog.empty': 'No updates yet.',
  'changelog.back': 'Back to home',
  'changelog.viewAll': 'View all updates',
  'changelog.latest': 'Latest',
  'changelog.typeFeature': 'New',
  'changelog.typeFix': 'Fix',
  'changelog.typeImprovement': 'Improvement',
  'changelog.typeBreaking': 'Breaking',

  // Pricing
  'pricing.title': 'Commercial license',
  'pricing.subtitle': 'Personal, educational, and contributor use is free. Three paid tiers for commercial use — we just want to make it work for you.',

  // Footer
  'footer.poweredBy': 'Built on blog-system design + an Obsidian-compatible layer',

  // Time
  'time.justNow': 'just now',
  'time.minutesAgo': '{n}m ago',
  'time.hoursAgo': '{n}h ago',
  'time.daysAgo': '{n}d ago',
};
