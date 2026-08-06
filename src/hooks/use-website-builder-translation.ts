import { useTranslation } from '@/hooks/use-translation';
import { getWebsiteBuilderTranslation } from '@/locales/website-builder';

export function useWebsiteBuilderTranslation() {
  const { language, setLanguage, applyLanguage, isLoading, t: globalT } = useTranslation();

  const t = (
    key: string,
    defaultValueOrVariables?: string | Record<string, string | number>,
    variables?: Record<string, string | number>
  ): string => {
    let defaultValue: string | undefined;
    let vars: Record<string, string | number> | undefined;

    if (typeof defaultValueOrVariables === 'string') {
      defaultValue = defaultValueOrVariables;
      vars = variables;
    } else if (typeof defaultValueOrVariables === 'object') {
      vars = defaultValueOrVariables;
    }

    // First try static JSON dictionary for Website Builder
    const localTranslation = getWebsiteBuilderTranslation(language, key, defaultValue, vars);
    
    // If key wasn't found in local dictionary (returns fallback or key), fallback to globalT
    if (localTranslation === key && globalT) {
      return globalT(key, defaultValueOrVariables as any, variables as any);
    }

    return localTranslation;
  };

  return {
    t,
    language,
    setLanguage,
    applyLanguage,
    isLoading,
  };
}

export default useWebsiteBuilderTranslation;
