import { Mail, Github, MessageCircle, ExternalLink, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { useTranslation } from '@/i18n';

const CHANNELS = [
  {
    icon: Github,
    title: 'GitHub Issues',
    desc: '公开讨论,适合 bug 反馈 / 功能建议。所有人都能看到进展。',
    href: 'https://github.com/Omlandc/obsidian-blog-webapp/issues',
    cta: '打开仓库',
    badge: '推荐',
  },
  {
    icon: MessageCircle,
    title: 'GitHub Discussions',
    desc: '轻量问题 / 想法 / 提问。不需要写 issue 那种正式格式。',
    href: 'https://github.com/Omlandc/obsidian-blog-webapp/discussions',
    cta: '发起讨论',
    badge: null,
  },
  {
    icon: Mail,
    title: '邮件',
    desc: '私密问题 / 内容版权 / 数据请求专用。回复通常 1-2 个工作日。',
    href: 'mailto:hello@obsidian-blog.example.com',
    cta: '发送邮件',
    badge: null,
  },
];

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Send className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-fg">{t('contact.title')}</h1>
        </div>
        <p className="text-fg-muted">
          想反馈 bug、提建议、报告版权问题、申请数据删除?挑一个顺手的渠道就行。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" />
                  {c.badge ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {c.badge}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold text-fg">{c.title}</h2>
                <p className="flex-1 text-sm text-fg-muted">{c.desc}</p>
                <Button asChild variant="outline" size="sm" className="self-start">
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {c.cta}
                    <ExternalLink className="ml-1.5 size-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">响应时间</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium text-fg">工作日</p>
              <p className="text-fg-muted">issues & discussions: 24h 内</p>
              <p className="text-fg-muted">邮件: 1-2 个工作日</p>
            </div>
            <div>
              <p className="font-medium text-fg">周末 / 节假日</p>
              <p className="text-fg-muted">issues 仍可能回复(主要靠自动通知)</p>
              <p className="text-fg-muted">邮件顺延到下一个工作日</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">联系前请读</h2>
          <ul className="space-y-2 text-fg-muted">
            <li>
              · 想反馈 bug?先在{' '}
              <a
                href="https://github.com/Omlandc/obsidian-blog-webapp/issues?q=is%3Aissue"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                已有 issues
              </a>{' '}
              里搜一下,避免重复提。
            </li>
            <li>
              · 想申请删除内容?请在邮件中提供 URL 和原因,
              我们会在 7 个工作日内处理。
            </li>
            <li>· 不接受商业推广 / SEO 外包 / 链接买卖类来信,会直接忽略。</li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-fg-subtle">
        <Link to="/privacy" className="text-fg-muted hover:text-fg">
          隐私政策
        </Link>{' '}
        ·{' '}
        <Link to="/about" className="text-fg-muted hover:text-fg">
          关于本站
        </Link>
      </p>
    </div>
  );
}