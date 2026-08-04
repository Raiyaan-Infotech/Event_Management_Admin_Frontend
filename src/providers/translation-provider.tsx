'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';
import type { TranslationMap } from '@/types';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  applyLanguage: (lang: string) => void;
  t: (key: string, defaultValueOrVariables?: string | Record<string, string | number>, variables?: Record<string, string | number>) => string;
  translations: TranslationMap;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const DEFAULT_LANGUAGE = 'en';

interface TranslationProviderProps {
  children: React.ReactNode;
  defaultLanguage?: string;
}

export function TranslationProvider({
  children,
  defaultLanguage = DEFAULT_LANGUAGE
}: TranslationProviderProps) {
  const [language, setLanguageState] = useState<string>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Track reported missing keys to avoid duplicate reports in the same session
  const reportedKeysRef = useRef<Set<string>>(new Set());
  // Batch missing key reports to reduce API calls
  const pendingReportsRef = useRef<Array<{ key: string; default_value: string; page_url: string }>>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFlushingRef = useRef(false);

  // Load previously reported keys from sessionStorage to prevent re-reporting on route transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('reported_missing_keys');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach((k) => reportedKeysRef.current.add(k));
        }
      }
    } catch {}
  }, []);

  // Fetch public settings to get the language preference
  const { data: publicSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: queryKeys.settings.public(),
    queryFn: async () => {
      const response = await apiClient.get('/settings/public');
      return response.data.data.settings as Record<string, string>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation to update language setting
  const updateLanguageMutation = useMutation({
    mutationFn: async (lang: string) => {
      await apiClient.put('/settings/language', { value: lang });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
    onError: (error) => {
      console.error('[Translation] Failed to save language preference:', error);
    },
  });

  // Initialize language from public settings
  useEffect(() => {
    if (publicSettings?.language) {
      setLanguageState(publicSettings.language);
    }
    if (!isLoadingSettings) {
      setIsInitialized(true);
    }
  }, [publicSettings, isLoadingSettings]);

  // Fetch translations with forced refetch on language change
  const { data: translations = {}, isLoading, isFetching } = useQuery({
    queryKey: ['translations', language],
    queryFn: async () => {
      const response = await apiClient.get(`/translations/${language}`);
      // Extract translations from API response: { success: true, data: { translations: {...} } }
      const translationData = response.data?.data?.translations || {};
      return translationData as TranslationMap;
    },
    enabled: isInitialized && !!language,
    staleTime: 10 * 60 * 1000, // 10 minutes - translations rarely change
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Apply language without saving to settings (used when settings are saved separately)
  const applyLanguage = useCallback((lang: string) => {
    if (lang === language) return; // No change needed

    // Update state
    setLanguageState(lang);

    // Invalidate cache to force refetch for new language
    queryClient.invalidateQueries({ queryKey: ['translations', lang] });
  }, [language, queryClient]);

  // Set language and save to settings API
  const setLanguage = useCallback((lang: string) => {
    if (lang === language) return; // No change needed

    // Update state immediately for responsive UI
    setLanguageState(lang);

    // Invalidate cache to force refetch for new language
    queryClient.invalidateQueries({ queryKey: ['translations', lang] });

    // Save to settings API
    updateLanguageMutation.mutate(lang);
  }, [language, queryClient, updateLanguageMutation]);

  // Flush batched missing key reports to backend sequentially with delay to prevent network/backend congestion
  const flushMissingKeys = useCallback(async () => {
    if (isFlushingRef.current) return;
    const batch = [...pendingReportsRef.current];
    if (batch.length === 0) return;

    // Clear pending batch and timer
    pendingReportsRef.current = [];
    batchTimerRef.current = null;
    isFlushingRef.current = true;

    // Cap to max 5 reports per batch to keep DB writes low
    const itemsToReport = batch.slice(0, 5);

    try {
      // Process sequentially with a 500ms breather between calls
      for (const report of itemsToReport) {
        await apiClient.post('/translations/report-missing', report).catch(() => {});
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      isFlushingRef.current = false;
      // If remaining items exist, schedule next batch flush after 10 seconds
      if (pendingReportsRef.current.length > 0) {
        batchTimerRef.current = setTimeout(flushMissingKeys, 10000);
      }
    }
  }, []);

  // Report missing key to backend (batched, deduplicated, non-blocking)
  const reportMissingKey = useCallback((key: string, defaultValue?: string) => {
    if (!key || reportedKeysRef.current.has(key)) return;

    // Mark as reported in memory and sessionStorage
    reportedKeysRef.current.add(key);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(
          'reported_missing_keys',
          JSON.stringify(Array.from(reportedKeysRef.current).slice(-500))
        );
      } catch {}
    }

    // Get current page URL
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    // Add to batch
    pendingReportsRef.current.push({
      key,
      default_value: defaultValue || key,
      page_url: pageUrl,
    });

    // Schedule flush if not already running or scheduled
    if (!batchTimerRef.current && !isFlushingRef.current) {
      batchTimerRef.current = setTimeout(flushMissingKeys, 5000);
    }
  }, [flushMissingKeys]);

  // Translation function with variable interpolation and missing key detection
  const t = useCallback((
    key: string,
    defaultValueOrVariables?: string | Record<string, string | number>,
    variables?: Record<string, string | number>
  ): string => {
    // Parse arguments - second param can be default value (string) or variables (object)
    let defaultValue: string | undefined;
    let vars: Record<string, string | number> | undefined;

    if (typeof defaultValueOrVariables === 'string') {
      defaultValue = defaultValueOrVariables;
      vars = variables;
    } else {
      vars = defaultValueOrVariables;
    }

    // Check if translation exists
    const translationExists = key in translations;
    // Fallback: default value → human-readable key (last segment, title-cased)
    const fallback = defaultValue || key.split('.').pop()!.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let text = translationExists ? translations[key] : fallback;

    // Report missing key if not found (only after translations are loaded)
    if (!translationExists && isInitialized && !isLoading && Object.keys(translations).length > 0) {
      reportMissingKey(key, defaultValue);
    }

    // Variable interpolation: {name} -> value
    if (vars) {
      Object.entries(vars).forEach(([varKey, value]) => {
        text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
      });
    }

    return text;
  }, [translations, isInitialized, isLoading, reportMissingKey]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    applyLanguage,
    t,
    translations,
    isLoading: !isInitialized || isLoading || isFetching,
  }), [language, setLanguage, applyLanguage, t, translations, isInitialized, isLoading, isFetching]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}

export { TranslationContext };