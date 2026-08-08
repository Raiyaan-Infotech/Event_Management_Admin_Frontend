/**
 * Overlays Website Builder content translations onto the raw records the
 * preview renders.
 *
 * This runs at the DATA layer — raw record in, raw record out with translated
 * text swapped in — so the section components stay language-agnostic and need
 * no changes. `buildHero`, `buildTestimonials` etc. keep receiving the shape
 * they already expect.
 *
 * A translation is addressed by a 5-part slot:
 *   (company_id, section, page_slug, record_id, field_key)
 * company_id is implicit in the request; the remaining four are the map key
 * `section|page_slug|record_id` plus the field name inside it. The section
 * names and field keys here MUST match FIELD_CATALOG in the backend's
 * websiteBuilderTranslation.service.js — a mismatch silently renders English
 * with no error anywhere.
 */

import type { AnyRecord } from './preview-shared';

/** `{ "faqs||13": { question: "...", answer: "..." } }` */
export type TranslationBundle = Record<string, Record<string, string>>;

export interface BundleResponse {
  language: {
    id: number;
    code: string;
    name: string;
    native_name?: string | null;
    direction?: 'ltr' | 'rtl';
    is_default?: boolean | number;
  } | null;
  translations: TranslationBundle;
}

const slotKey = (section: string, pageSlug: string, recordId: number | string) =>
  `${section}|${pageSlug || ''}|${recordId || 0}`;

/** Blank/whitespace translations fall back to the English source. */
const usable = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function parseJson(value: unknown): AnyRecord | null {
  if (!value) return null;
  if (typeof value === 'object') return value as AnyRecord;
  try {
    return JSON.parse(String(value)) as AnyRecord;
  } catch {
    return null;
  }
}

/**
 * Sections whose translated field keys don't map 1:1 onto columns.
 *
 * Hero is the only one so far: its CTA labels are registered as flat
 * `button_1_label` / `button_2_label` keys but live nested inside the
 * `button_1_json` / `button_2_json` columns, so they must be written back into
 * that JSON rather than set as top-level fields.
 */
/**
 * Writes a translated `<prefix>_<n>` key set back into a JSON column holding a
 * flat string array. Positions are 1-based, matching the backend extractors in
 * websiteBuilderTranslation.service.js — the two must agree or the translated
 * text lands on the wrong bullet.
 */
const writeIndexedArray = (
  record: AnyRecord,
  values: Record<string, string>,
  column: string,
  prefix: string
) => {
  const current = parseJson(record[column]);
  const list =
    Array.isArray(current)
      ? current
      : typeof record[column] === 'string'
        ? []
        : null;
  if (!list || list.length === 0) return;

  let touched = false;
  const next = list.map((entry: unknown, index: number) => {
    const translated = values[`${prefix}_${index + 1}`];
    if (!usable(translated)) return entry;
    touched = true;
    return translated;
  });
  if (touched) record[column] = next;
};

const NESTED_FIELD_WRITERS: Record<string, (record: AnyRecord, values: Record<string, string>) => void> = {
  'hero-section': (record, values) => {
    ([
      ['button_1_label', 'button_1_json'],
      ['button_2_label', 'button_2_json'],
    ] as const).forEach(([fieldKey, column]) => {
      if (!usable(values[fieldKey])) return;
      const button = parseJson(record[column]);
      if (!button) return;
      record[column] = { ...button, label: values[fieldKey] };
    });
  },
  // Feature card bullet lists — `bullet_points_json` is a plain string array.
  features: (record, values) => writeIndexedArray(record, values, 'bullet_points_json', 'bullet'),
  // Plan tick-lists — `features_json` is a plain string array.
  'pricing-plans': (record, values) => writeIndexedArray(record, values, 'features_json', 'feature'),
};

/**
 * Field keys consumed by a nested writer — never set as plain columns.
 * A predicate rather than a set, because the indexed array keys are open-ended
 * (`bullet_1`, `bullet_2`, … for as many entries as the row has).
 */
const NESTED_FIELD_KEYS: Record<string, (fieldKey: string) => boolean> = {
  'hero-section': (key) => key === 'button_1_label' || key === 'button_2_label',
  features: (key) => /^bullet_\d+$/.test(key),
  'pricing-plans': (key) => /^feature_\d+$/.test(key),
};

export interface Translator {
  /** True when a non-default language is active and an overlay should apply. */
  readonly active: boolean;
  /** Translate one record (singleton sections, or a hero row for one page). */
  one: <T extends AnyRecord>(section: string, record: T, pageSlug?: string) => T;
  /** Translate every record in a list section, each by its own id. */
  many: <T extends AnyRecord>(section: string, records: T[], pageSlug?: string) => T[];
  /** Translate a bare string field for a slot — for text not held on a record. */
  field: (section: string, recordId: number | string, fieldKey: string, fallback: string, pageSlug?: string) => string;
}

/**
 * Builds a translator for one language bundle. Returns a pass-through when no
 * language is active, so callers can wrap unconditionally.
 */
export function createTranslator(bundle: TranslationBundle | undefined | null, enabled: boolean): Translator {
  if (!enabled || !bundle || Object.keys(bundle).length === 0) {
    return {
      active: false,
      one: (_section, record) => record,
      many: (_section, records) => records,
      field: (_section, _recordId, _fieldKey, fallback) => fallback,
    };
  }

  const applyTo = <T extends AnyRecord>(section: string, record: T, pageSlug: string): T => {
    if (!record || typeof record !== 'object') return record;

    // Singleton sections register at record_id = the row id; fall back to 0 for
    // records that reach the preview without one.
    const values = bundle[slotKey(section, pageSlug, Number(record.id) || 0)];
    if (!values) return record;

    const isNestedKey = NESTED_FIELD_KEYS[section];
    const next = { ...record } as AnyRecord;
    let changed = false;

    Object.entries(values).forEach(([fieldKey, value]) => {
      if (isNestedKey?.(fieldKey)) return;
      if (!usable(value)) return;
      next[fieldKey] = value;
      changed = true;
    });

    const writeNested = NESTED_FIELD_WRITERS[section];
    if (writeNested) {
      // Snapshot the whole record rather than named columns — each section's
      // writer touches different ones.
      const before = JSON.stringify(next);
      writeNested(next, values);
      if (JSON.stringify(next) !== before) changed = true;
    }

    return (changed ? next : record) as T;
  };

  return {
    active: true,
    one: (section, record, pageSlug = '') => applyTo(section, record, pageSlug),
    many: (section, records, pageSlug = '') =>
      Array.isArray(records) ? records.map((record) => applyTo(section, record, pageSlug)) : records,
    field: (section, recordId, fieldKey, fallback, pageSlug = '') => {
      const value = bundle[slotKey(section, pageSlug, recordId)]?.[fieldKey];
      return usable(value) ? value : fallback;
    },
  };
}
