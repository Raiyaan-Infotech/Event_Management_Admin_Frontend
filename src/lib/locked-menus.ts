/**
 * Menus every plan grants and every event gets. The plan wizard shows them
 * ticked and disabled, and Menu Management cannot flip them to Add-on: an
 * event missing one of these would be missing a core screen.
 */
export const LOCKED_MENU_SLUGS = [
    'splash-screens',
    'event-invitation',
    'participants',
    'venue',
    'rsvp',
    'agenda',
    'guests',
] as const;

export const isLockedMenu = (slug?: string | null): boolean =>
    !!slug && (LOCKED_MENU_SLUGS as readonly string[]).includes(slug);
