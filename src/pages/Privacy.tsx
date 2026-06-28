import { Shield, Database, ExternalLink, Mail, Cookie } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { siteSEO } from '@/seo.config';
import { useTranslation } from '@/i18n';

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">{t('privacy.title')}</h1>
        </div>
        <p className="text-fg-muted">
          最后更新: {new Date().toISOString().slice(0, 10)} · 适用站点:{' '}
          <code className="rounded bg-bg-subtle px-1 text-fg">{siteSEO.siteUrl}</code>
        </p>
        <p className="text-fg-muted">
          这是一份<strong className="text-fg">短</strong>隐私政策 —— 因为本站几乎不收集任何东西。
          详细的政策通常意味着站点在偷偷做不该做的事。
        </p>
      </header>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">1. 我们收集什么</h2>
          <p className="mt-2 text-fg-muted">
            本站是一个<strong className="text-fg">纯静态博客</strong>,由 Vite 构建、托管在 CDN 上。
            除非你主动留言或联系我们,我们不会向你的浏览器写入任何可识别个人身份的数据。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-fg">
            <Cookie className="size-5 text-primary" />
            2. Cookie 政策
          </h2>
          <p className="mt-2 text-fg-muted">本站使用两类 Cookie:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-fg-muted">
            <li>
              <strong className="text-fg">必需 Cookie</strong>:保存你的"已同意"状态,避免下次访问重复弹出横幅。
            </li>
            <li>
              <strong className="text-fg">广告 Cookie</strong>:仅在你点击"同意"后,Google AdSense 才会写入。
              用于个性化广告与跨站频次控制(ePrivacy 要求)。
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">3. Google AdSense 与第三方广告</h2>
          <p className="mt-2 text-fg-muted">
            本站使用 Google AdSense 投放广告。Google 作为第三方供应商,
            会使用 Cookie 在本站及其他网站上,根据你的访问记录投放广告。
          </p>
          <p className="mt-2 text-fg-muted">
            你可以访问{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Google Ads 设置 <ExternalLink className="inline size-3" />
            </a>{' '}
            管理个性化广告,或在{' '}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              aboutads.info <ExternalLink className="inline size-3" />
            </a>{' '}
            退出基于兴趣的广告。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">4. 分析与日志</h2>
          <p className="mt-2 text-fg-muted">
            本站不部署任何自建分析。CDN / 部署平台可能会保留标准访问日志(IP、UA、响应码),
            用于安全防护和故障排查 —— 这些日志<strong className="text-fg">不会</strong>
            与广告业务共享。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">5. 你的权利</h2>
          <p className="mt-2 text-fg-muted">依据 GDPR / 中国《个人信息保护法》,你有权:</p>
          <ul className="mt-2 grid gap-1 pl-6 text-fg-muted sm:grid-cols-2">
            <li>· <strong className="text-fg">知情</strong>: 知道哪些数据被收集</li>
            <li>· <strong className="text-fg">拒绝</strong>: 拒绝非必需 Cookie</li>
            <li>· <strong className="text-fg">删除</strong>: 申请清除留下的记录</li>
            <li>· <strong className="text-fg">导出</strong>: 导出可识别信息副本</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">6. 政策更新</h2>
          <p className="mt-2 text-fg-muted">
            政策可能随法律法规或业务变更更新,改动会反映在本页顶部的日期。
            继续使用本站即视为同意最新版本。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">7. 联系我们</h2>
          <p className="mt-2 text-fg-muted">
            对数据处理有任何疑问,通过{' '}
            <a
              href="https://github.com/Omlandc/obsidian-blog-webapp/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              GitHub Issues <ExternalLink className="inline size-3" />
            </a>{' '}
            或{' '}
            <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
              联系页面
            </Link>
            。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated p-4 text-sm text-fg-muted">
        <span className="flex items-center gap-2">
          <Database className="size-4" />
          想清除你在本站留下的痕迹?
        </span>
        <Button asChild variant="outline" size="sm">
          <a
            href="https://github.com/Omlandc/obsidian-blog-webapp/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="mr-1.5 size-3.5" />
            联系站长
            <ExternalLink className="ml-1.5 size-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}