/**
 * "Nikah · Islam" — which event type / religion a menu belongs to.
 *
 * Menu Management requires a religion on every menu, so the same menu exists
 * once per type/religion (Gallery for Nikah, Gallery for Thirumanam, …). On the
 * plan screens those copies are otherwise indistinguishable. Empty for menus
 * with no scope (portal sections, app features), which apply to every event.
 */
export function menuScopeLabel(menu?: {
    eventType?: { name: string } | null;
    religion?: { name: string } | null;
} | null): string {
    if (!menu) return '';
    return [menu.eventType?.name, menu.religion?.name].filter(Boolean).join(' · ');
}
