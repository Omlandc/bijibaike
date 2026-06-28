import { cn } from '@/lib/utils';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  Quote,
  BookOpen,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';

type CalloutType = 'note' | 'info' | 'tip' | 'warning' | 'danger' | 'quote' | 'example';

const CALLOUT_META: Record<
  CalloutType,
  { icon: LucideIcon; label: string; classes: string; iconClass: string }
> = {
  note: {
    icon: StickyNote,
    label: 'Note',
    classes: 'border-blue-500/40 bg-blue-500/5',
    iconClass: 'text-blue-500',
  },
  info: {
    icon: Info,
    label: 'Info',
    classes: 'border-cyan-500/40 bg-cyan-500/5',
    iconClass: 'text-cyan-500',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    classes: 'border-emerald-500/40 bg-emerald-500/5',
    iconClass: 'text-emerald-500',
  },
  example: {
    icon: BookOpen,
    label: 'Example',
    classes: 'border-violet-500/40 bg-violet-500/5',
    iconClass: 'text-violet-500',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    classes: 'border-amber-500/50 bg-amber-500/10',
    iconClass: 'text-amber-500',
  },
  danger: {
    icon: AlertOctagon,
    label: 'Danger',
    classes: 'border-red-500/50 bg-red-500/10',
    iconClass: 'text-red-500',
  },
  quote: {
    icon: Quote,
    label: 'Quote',
    classes: 'border-muted-foreground/30 bg-muted/40',
    iconClass: 'text-muted-foreground',
  },
};

export function CalloutTypeMeta(t: string): CalloutType {
  return (CALLOUT_META[t as CalloutType] ? (t as CalloutType) : 'note');
}

interface CalloutProps {
  type: string;
  className?: string;
  children: React.ReactNode;
}

export function Callout({ type, className, children }: CalloutProps) {
  const meta = CALLOUT_META[CalloutTypeMeta(type)];
  const Icon = meta.icon;
  return (
    <aside
      className={cn(
        'my-6 flex gap-3 rounded-lg border-l-4 px-4 py-3',
        meta.classes,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', meta.iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
          {meta.label}
        </div>
        <div className="prose-callout text-sm leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
