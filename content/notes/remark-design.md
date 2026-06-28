---
title: 怎么让 React 读 Obsidian
date: 2026-06-15
tags: [engineering, markdown, obsidian]
description: 把 wiki-link 和 callout 变成 React 组件,而不是字符串替换。
---

# 设计选择

> [!info] TL;DR
> 用 `react-markdown` + 自定义 `remark` 插件,把 `[[双链]]` 转成有 `data-*` 标记的 AST link 节点,
> 在 `components.a` 里根据 `href === 'wikilink:slug'` 路由回内部 React Router。

## 为什么不用字符串替换?

最直接的做法是写一个 `replace(/\[\[([^\]]+)\]\]/g, ...)` 在 markdown → HTML 之间插一脚。但这样:

1. 不知道目标是否存在 → 不能给出"虚线"样式
2. 不知道是不是 `![[embed]]` → 不能区分渲染
3. 不知道 `#heading` 锚点 → 链接的 href 拼不出来
4. 跟 markdown 解析器抢语法 → 边界 case 容易崩

## 走 AST

```ts
// remark-wikilink.ts
visit(tree, 'text', (node, index, parent) => {
  const parts = splitOnWikiLinks(node.value);
  parent.children.splice(index, 1, ...parts);
});
```

- `[[X]]` → `link` 节点,`url: 'wikilink:slug'`,带 `data-h-properties`
- `![[X]]` → 同样的 link 节点,额外 `data-wiki-embed="true"`

然后 `rehype-raw` 让数据属性穿透,`rehype-sanitize` 在白名单里允许这些属性。

## 组件层

```tsx
components: {
  a({ href, children, ...rest }) {
    if (href?.startsWith('wikilink:')) {
      return <WikiLink slug={...} {...rest}>{children}</WikiLink>;
    }
    // ...外部链接、路由链接
  }
}
```

## callout 怎么做

`> [!note] 内容` 是 blockquote 套子句,直接处理 AST 麻烦。我们走两步:

1. 在 `lib/obsidian.ts` 的 `transformCallouts` 把 blockquote 序列重写成 fenced div 指令:

   ```
   :::callout[note]
   内容
   :::
   ```

2. `remark-directive` 把 `:::name[label]` 解析成 `containerDirective` 节点,我们再用一个 `remark-callout` 插件给它打 `data-callout` 属性,`components.p` 看到就转成 `<Callout type="...">`。

## 痛点

> [!danger] 已知问题
> `verbatimModuleSyntax: true` + react-markdown 的 ESM 兼容性偶尔会折腾。可以考虑改用 `next-mdx-remote` 或自己写 transform。
> 当前在 Vite 7 + react-markdown 9.x 测过 OK。

详见 [[projects/roadmap]]。
