import { toPng, toSvg } from 'html-to-image';
import { apiClient } from '@/lib/api-client';

/**
 * Downloads a rendered invitation (or frame / decoration preview) card as a
 * PNG or SVG file.
 *
 * ── WHY IMAGES ARE INLINED FIRST ──────────────────────────────────────────
 * The storage bucket sends no `Access-Control-Allow-Origin` header (see the
 * note on `decoration.service.js`'s `getSvgSource`). Both `toPng` (via an
 * internal `<canvas>`) and `toSvg` (which embeds each image as a data URI)
 * need to actually READ the pixels of every image on the card, and a
 * cross-origin image with no CORS header cannot be read back out — the
 * canvas is "tainted" and `toDataURL()`/`toBlob()` throw a SecurityError,
 * and `toSvg`'s own fetch-and-inline gets an opaque response it cannot embed.
 *
 * The fix is the same one already used for reading an SVG's palette: the
 * SERVER fetches the file (no CORS restriction there) and hands it back as a
 * base64 data URI via `GET /media/proxy`. Every `<img src>` and inline
 * `background-image` under the captured node is swapped to its data URI
 * before the snapshot, and swapped BACK afterwards — the swap is a capture-
 * time trick, not a real change to what the page is showing.
 *
 * ── WHAT "SVG" ACTUALLY MEANS HERE ────────────────────────────────────────
 * `toSvg` wraps the card's live DOM in a `<foreignObject>` inside an `<svg>` —
 * a real, openable SVG file, but the text stays HTML rather than becoming
 * `<text>` paths. That is `html-to-image`'s own format, not a limitation
 * added here; a true vector re-flow of the invitation's text would mean
 * building the card as SVG in the first place.
 */

export type ExportFormat = 'png' | 'svg';

const URL_IN_CSS = /url\((['"]?)(.*?)\1\)/;

/** Every element whose background-image is a `url(...)` this page can rewrite. */
function backgroundImageElements(root: HTMLElement): HTMLElement[] {
    const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    return all.filter((el) => URL_IN_CSS.test(el.style.backgroundImage || ''));
}

/** Resolves once every `<img>` under `root` has finished loading (or failed). */
function waitForImages(root: HTMLElement): Promise<void[]> {
    const imgs = Array.from(root.querySelectorAll('img'));
    return Promise.all(
        imgs.map(
            (img) =>
                new Promise<void>((resolve) => {
                    if (img.complete) return resolve();
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                })
        )
    );
}

/**
 * Fetches one file through the server and returns it as a data URI. Data
 * URIs and same-page asset (`/`-relative, `blob:`) sources are returned as-is
 * — there is nothing external to inline.
 */
async function toDataUri(url: string, cache: Map<string, string>): Promise<string> {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cached = cache.get(url);
    if (cached) return cached;

    try {
        const response = await apiClient.get('/media/proxy', { params: { url } });
        const dataUri: string = response.data?.data?.dataUri ?? url;
        cache.set(url, dataUri);
        return dataUri;
    } catch {
        // Best-effort: leave the original URL in place rather than failing the
        // whole export over one broken asset (a deleted file, a stale link).
        return url;
    }
}

/** Swaps every external image under `node` to a data URI, runs `capture`, restores the DOM. */
async function withInlinedImages<T>(node: HTMLElement, capture: () => Promise<T>): Promise<T> {
    const cache = new Map<string, string>();
    const imgs = Array.from(node.querySelectorAll('img'));
    const bgEls = backgroundImageElements(node);

    const originalImgSrc = new Map<HTMLImageElement, string>();
    const originalBg = new Map<HTMLElement, string>();

    try {
        await Promise.all([
            ...imgs.map(async (img) => {
                originalImgSrc.set(img, img.src);
                img.src = await toDataUri(img.src, cache);
            }),
            ...bgEls.map(async (el) => {
                const original = el.style.backgroundImage;
                originalBg.set(el, original);
                const match = URL_IN_CSS.exec(original);
                if (!match) return;
                const inlined = await toDataUri(match[2], cache);
                el.style.backgroundImage = original.replace(match[2], inlined);
            }),
        ]);

        // The swapped `<img>` sources just started loading again.
        await waitForImages(node);

        return await capture();
    } finally {
        // Restore, even if the capture failed partway through.
        for (const [img, src] of originalImgSrc) img.src = src;
        for (const [el, bg] of originalBg) el.style.backgroundImage = bg;
    }
}

function triggerDownload(href: string, filename: string) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

/**
 * Captures `node` as a PNG or SVG and starts a browser download.
 *
 * `baseName` is used WITHOUT an extension — the right one (`.png` / `.svg`)
 * is appended for the format actually requested, so a caller cannot hand in
 * `invitation.png` and get `invitation.png.svg` out the other end.
 */
export async function downloadNodeAsImage(
    node: HTMLElement,
    baseName: string,
    format: ExportFormat = 'png',
    options: { pixelRatio?: number } = {}
): Promise<void> {
    const name = baseName.replace(/\.(png|svg)$/i, '');

    await withInlinedImages(node, async () => {
        const dataUrl =
            format === 'svg'
                ? await toSvg(node, { cacheBust: true })
                : await toPng(node, { pixelRatio: options.pixelRatio ?? 3, cacheBust: true });

        triggerDownload(dataUrl, `${name}.${format}`);
    });
}

/** @deprecated use `downloadNodeAsImage(node, name, 'png')` */
export async function downloadNodeAsPng(
    node: HTMLElement,
    filename: string,
    options: { pixelRatio?: number } = {}
): Promise<void> {
    return downloadNodeAsImage(node, filename, 'png', options);
}
