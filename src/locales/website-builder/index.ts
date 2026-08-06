import en from './en.json';
import hi from './hi.json';

export const websiteBuilderTranslations: Record<string, Record<string, any>> = {
  en,
  hi,
};

/**
 * Utility to resolve nested dictionary values by key string (e.g., 'header.home')
 */
export function getWebsiteBuilderTranslation(
  lang: string,
  key: string,
  defaultValue?: string,
  variables?: Record<string, string | number>
): string {
  const dict = websiteBuilderTranslations[lang] || websiteBuilderTranslations['en'] || {};
  const parts = key.split('.');
  
  let val: any = dict;
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      val = undefined;
      break;
    }
  }

  // Fallback to English dictionary if not found in target language
  if (val === undefined && lang !== 'en') {
    let enVal: any = websiteBuilderTranslations['en'];
    for (const part of parts) {
      if (enVal && typeof enVal === 'object' && part in enVal) {
        enVal = enVal[part];
      } else {
        enVal = undefined;
        break;
      }
    }
    if (typeof enVal === 'string') {
      val = enVal;
    }
  }

  let result = typeof val === 'string' ? val : defaultValue || key;

  // Perform variable substitution (e.g. {planName} -> "Starter")
  if (variables && typeof variables === 'object') {
    Object.entries(variables).forEach(([vKey, vVal]) => {
      result = result.replace(new RegExp(`\\{${vKey}\\}`, 'g'), String(vVal));
    });
  }

  return result;
}
