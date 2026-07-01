/**
 * /pricing — commercial license tiers.
 *
 * Three tiers, each with a clear "what you can / can't do" line so
 * readers can self-select without a sales call. The Personal tier is
 * free under the source-available license; the two paid tiers
 * require a commercial license. The actual prices are intentionally
 * left as TBD placeholders so the copyright holder can fill them in
 * before the page goes public.
 *
 * Contact CTA links to /contact (which now also has a commercial
 * licensing line). The contact email itself is also shown directly
 * for users who just want to send a mail.
 */
import { Link } from 'react-router';
import {
  Sparkles,
  Building2,
  Rocket,
  Check,
  X as XIcon,
  Mail,
  FileText,
  Code2,
  Headphones,
  Server,
  Scale,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site-config';

type TierId = 'personal' | 'indie' | 'team';

interface Tier {
  id: TierId;
  icon: typeof Sparkles;
  price: string;
  cadence: string;
  blurb: string;
  includes: string[];
  excludes: string[];
  cta: { label: string; to?: string; href?: string; variant?: 'default' | 'outline' };
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'personal',
    icon: Sparkles,
    price: '免费',
    cadence: '永久',
    blurb: '个人 / 学习 / 非商业部署',
    includes: [
      '源码可用,随便改',
      '用于个人博客、笔记系统、研究',
      '贡献代码到本仓库',
      '无月活上限(只要不商业化)',
    ],
    excludes: [
      '不能用于商业项目',
      '不能挂广告联盟做主要收入',
    ],
    cta: { label: '下载源码', to: 'https://github.com/Omlandc/obsidian-blog-webapp' },
  },
  {
    id: 'indie',
    icon: Rocket,
    price: '询价',
    cadence: '一次性',
    blurb: '独立开发者 / 小型项目 / 接活',
    includes: [
      '商业项目部署授权',
      '单域名 / 单部署',
      '12 个月源码更新',
      '邮件支持(2 个工作日内回复)',
      '可付费续期升级',
    ],
    excludes: [
      '不能用于多个客户项目(每个客户单独授权)',
      '不包含专属功能定制',
    ],
    cta: { label: '申请授权', to: '/contact', variant: 'default' },
    highlight: true,
  },
  {
    id: 'team',
    icon: Building2,
    price: '询价',
    cadence: '年付',
    blurb: '团队 / SaaS / 高流量商业站点',
    includes: [
      '无限部署 / 团队成员',
      '12 个月优先邮件支持',
      '包含 4 小时定制咨询',
      '可签书面授权协议',
      '可加 SLA 兜底条款',
    ],
    excludes: [
      '不能转售源码',
    ],
    cta: { label: '联系销售', to: '/contact' },
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: '"个人免费"具体怎么界定?',
    a: '你的个人博客、笔记系统、学习、贡献都免费。挂个小广告也行(Google AdSense 类),只要不是主要收入来源,且月活不超过 1 万。',
  },
  {
    q: '我接私活用这套,算商业吗?',
    a: '看具体情况:用这套给客户部署一个博客,通常算商业(Indie 档)。自己接活、给客户做方案、但博客本身还是你个人项目,不接客户的钱,可能还是个人档(具体看合同)。',
  },
  {
    q: '可以试用吗?',
    a: '可以。clone 下来随便改,本地开发随便试,部署到测试域名也行。真正要给付费用户用之前再联系授权。',
  },
  {
    q: '能签书面协议吗?',
    a: 'Team 档默认会出书面协议。Indie 档默认是邮件授权 + 收据(满足大多数法务要求),如果你需要纸质合同,沟通时说一下。',
  },
  {
    q: '能不能给开源项目免费用?',
    a: '可以,只要你的项目本身是非商业 / 开源 / 公益性质,发邮件说明项目情况,基本都给免费授权。',
  },
  {
    q: '我已经在用了,之前是 MIT 看的,怎么办?',
    a: '2026-06-29 之前已经部署的实例不受新协议影响(继续按当时看到的开源规则用)。从今天起新部署 / 重大升级按新协议。',
  },
];

export default function Pricing() {
  return (
    <div className="space-y-12">
      <header className="space-y-3 text-center">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
          <Scale className="size-7 text-primary" />
          商业授权定价
        </h1>
        <p className="mx-auto max-w-2xl text-fg-muted">
          个人 / 学习 / 贡献完全免费。商业使用三档可选,功能差异见下表。
          价格按需,谈得来最重要。
        </p>
      </header>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col',
                tier.highlight && 'border-primary shadow-lg shadow-primary/10',
              )}
            >
              {tier.highlight ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="rounded-full bg-primary px-3 py-1 text-xs text-primary-fg">
                    最受欢迎
                  </Badge>
                </div>
              ) : null}
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-fg">{tier.blurb}</h2>
                </div>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-fg">{tier.price}</span>
                  <span className="text-sm text-fg-muted">{tier.cadence}</span>
                </div>
                <p className="mb-4 text-sm text-fg-subtle">{tier.id === 'personal' ? '无需付费,clone 即用' : '按项目询价'}</p>

                <div className="mb-4 space-y-1.5 text-sm">
                  {tier.includes.map((line) => (
                    <div key={line} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span className="text-fg">{line}</span>
                    </div>
                  ))}
                  {tier.excludes.map((line) => (
                    <div key={line} className="flex items-start gap-2">
                      <XIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                      <span className="text-fg-muted">{line}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  {tier.cta.href ? (
                    <Button asChild variant={tier.cta.variant ?? 'outline'} className="w-full">
                      <a href={tier.cta.href} target="_blank" rel="noreferrer">
                        {tier.cta.label}
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant={tier.cta.variant ?? 'default'} className="w-full">
                      <Link to={tier.cta.to ?? '/contact'}>{tier.cta.label}</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* What's in every tier */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Perk icon={Code2} label="完整源码" note="包含所有组件、主题、构建脚本" />
          <Perk icon={FileText} label="SEO / Sitemap / robots.txt" note="build 时自动生成" />
          <Perk icon={Server} label="静态产物" note="丢任何 CDN / 静态托管即用" />
          <Perk icon={Headphones} label="邮件支持" note="Indie 起可走工单" />
        </CardContent>
      </Card>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-fg">常见问题</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <Card key={f.q}>
              <CardContent className="space-y-2 p-5">
                <h3 className="text-sm font-semibold text-fg">{f.q}</h3>
                <p className="text-sm text-fg-muted">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-fg">不确定该选哪档?</h3>
            <p className="text-sm text-fg-muted">把你的项目情况说一下,几个工作日内回复。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/contact">
                <Mail className="mr-1.5 size-4" />
                联系我们
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${siteConfig.site.social?.email || ''}`}>
                {siteConfig.site.social?.email || '通过联系页发送邮件'}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Perk({
  icon: Icon,
  label,
  note,
}: {
  icon: typeof Sparkles;
  label: string;
  note: string;
}) {
  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-fg">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="text-xs text-fg-muted">{note}</p>
    </div>
  );
}
