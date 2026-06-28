/**
 * LanguageSwitcher — dropdown that flips the active i18n language.
 * Sits next to the theme switcher in the header.
 */
import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, SUPPORTED_LANGUAGES, type Language } from '@/i18n';

const LABELS: Record<Language, string> = {
  zh: '中文',
  en: 'English',
};

export function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          aria-label={t('lang.switch')}
        >
          <Languages className="size-3.5" />
          <span className="hidden sm:inline">{LABELS[lang]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {SUPPORTED_LANGUAGES.map((id) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => setLang(id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex-1 text-sm">{LABELS[id]}</span>
            {lang === id ? <Check className="size-3.5 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
