/**
 * A menu is locked when it is marked Default in Menu Management — read from the
 * menu row, never from a slug list, so a menu added tomorrow is locked by
 * ticking Default and needs no code change (2026-09-25).
 *
 * Locked means: every plan grants it (the plan wizard shows it ticked and
 * disabled, and the backend adds it back on save) and no event can switch it
 * off. Add-on menus are optional on the plan and switchable per event.
 */
export const isLockedMenu = (menu?: { is_default?: number | boolean | null } | null): boolean =>
    Number(menu?.is_default) === 1;
