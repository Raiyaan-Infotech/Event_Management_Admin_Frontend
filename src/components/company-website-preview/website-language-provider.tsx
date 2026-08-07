'use client';

/**
 * Language state for the RENDERED website (preview and public site).
 *
 * Deliberately separate from `useTranslation()` / `setLanguage()`, which persist
 * the ADMIN panel's language into General Settings. A site visitor switching the
 * website to Tamil must not relabel the admin UI, so this keeps its own state.
 *
 * It provides two different kinds of translation, which are easy to confuse:
 *   - `t(key)`     — static UI chrome ("Login", "Choose Plan") from the bundled
 *                    src/locales/website-builder/*.json dictionaries.
 *   - `translator` — admin-entered CONTENT (hero title, FAQ answers) from the
 *                    company_website_content_translations table.
 */

import * as React from 'react';
import {
  usePublicBuilderLanguages,
  useTranslationBundle,
  type PublicBuilderLanguage,
} from '@/hooks/useWebsiteBuilderTranslations';
import { getWebsiteBuilderTranslation } from '@/locales/website-builder';
import { createTranslator, type Translator } from './sections/preview-translate';

const STORAGE_KEY = 'website-preview-language';

interface WebsiteLanguageValue {
  /** Active language code, e.g. 'en' | 'ta'. */
  language: string;
  setLanguage: (code: string) => void;
  /** Active languages from the DB, default first. Empty while loading. */
  languages: PublicBuilderLanguage[];
  activeLanguage: PublicBuilderLanguage | null;
  direction: 'ltr' | 'rtl';
  /** Content overlay for the active language. Pass-through on the default language. */
  translator: Translator;
  /** True while the content bundle for a non-default language is still loading. */
  isLoadingBundle: boolean;
  /** Static UI-chrome dictionary lookup, bound to the active language. */
  t: (key: string, defaultValue?: string, variables?: Record<string, string | number>) => string;
}

const WebsiteLanguageContext = React.createContext<WebsiteLanguageValue | null>(null);

function readStoredLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    // An explicit ?lang= in the URL wins — it's how the site links to a
    // specific language version and how the admin previews one.
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && !/^\d+$/.test(fromUrl)) return fromUrl.toLowerCase();
    return window.localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function WebsiteLanguageProvider({ children }: { children: React.ReactNode }) {
  // Resolved in an effect rather than an initialiser so server and first client
  // render agree — reading localStorage during render causes hydration mismatch.
  const [language, setLanguageState] = React.useState('en');

  React.useEffect(() => {
    const stored = readStoredLanguage();
    if (stored !== 'en') setLanguageState(stored);
  }, []);

  const { data: languages = [] } = usePublicBuilderLanguages();
  const { data: bundleResponse, isLoading: isLoadingBundle } = useTranslationBundle(language);

  const defaultCode = React.useMemo(
    () => languages.find((lang) => lang.is_default)?.code || 'en',
    [languages]
  );

  // A language that was removed or deactivated in the admin must not leave the
  // site stuck on a code that no longer resolves.
  React.useEffect(() => {
    if (languages.length === 0 || language === defaultCode) return;
    if (!languages.some((lang) => lang.code === language)) setLanguageState(defaultCode);
  }, [languages, language, defaultCode]);

  const setLanguage = React.useCallback((code: string) => {
    const next = (code || 'en').toLowerCase();
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      // Keep the URL shareable — a copied link reopens in the same language.
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Private-mode storage failures shouldn't break switching.
    }
  }, []);

  const activeLanguage = React.useMemo(
    () => languages.find((lang) => lang.code === language) || null,
    [languages, language]
  );

  const isDefault = !activeLanguage || activeLanguage.is_default;

  const translator = React.useMemo(
    () => createTranslator(bundleResponse?.translations, !isDefault),
    [bundleResponse?.translations, isDefault]
  );

  const direction = activeLanguage?.direction === 'rtl' ? 'rtl' : 'ltr';

  // Static UI chrome ("Contact Us", "Send Message") is registered under a
  // fixed slot on the SAME content-translations table as admin-entered
  // content — see UI_CHROME_KEYS in the backend service — so it can be
  // edited and auto-translated from the same admin Translations page instead
  // of hand-editing locale JSON files. `bundleResponse` already contains it:
  // the backend query has no section filter, so one bundle fetch covers both
  // content and chrome. A key with no DB override falls back to the bundled
  // src/locales/website-builder/*.json dictionary, so nothing regresses for
  // strings that haven't been given a DB translation yet.
  const uiChromeOverrides = bundleResponse?.translations?.['ui-chrome||0'];
  const t = React.useCallback(
    (key: string, defaultValue?: string, variables?: Record<string, string | number>) => {
      const override = !isDefault ? uiChromeOverrides?.[key]?.trim() : '';
      const base = override || getWebsiteBuilderTranslation(language, key, defaultValue, variables);
      if (!override || !variables) return base;
      // The static lookup already applies {variable} substitution; a DB
      // override needs the same treatment since it bypasses that path.
      return Object.entries(variables).reduce(
        (result, [varKey, varVal]) => result.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal)),
        base
      );
    },
    [language, isDefault, uiChromeOverrides]
  );

  const value = React.useMemo<WebsiteLanguageValue>(
    () => ({
      language,
      setLanguage,
      languages,
      activeLanguage,
      direction,
      translator,
      // Only meaningful for a non-default language; the default never fetches.
      isLoadingBundle: !isDefault && isLoadingBundle,
      t,
    }),
    [language, setLanguage, languages, activeLanguage, direction, translator, isDefault, isLoadingBundle, t]
  );

  return <WebsiteLanguageContext.Provider value={value}>{children}</WebsiteLanguageContext.Provider>;
}

/**
 * Safe outside the provider — falls back to English with a pass-through
 * translator so preview sections can be rendered standalone (e.g. in the
 * section-level previews used inside builder forms).
 */
export function useWebsiteLanguage(): WebsiteLanguageValue {
  const context = React.useContext(WebsiteLanguageContext);
  const fallbackTranslator = React.useMemo(() => createTranslator(null, false), []);

  return React.useMemo(
    () =>
      context || {
        language: 'en',
        setLanguage: () => {},
        languages: [],
        activeLanguage: null,
        direction: 'ltr' as const,
        translator: fallbackTranslator,
        isLoadingBundle: false,
        t: (key: string, defaultValue?: string, variables?: Record<string, string | number>) =>
          getWebsiteBuilderTranslation('en', key, defaultValue, variables),
      },
    [context, fallbackTranslator]
  );
}
