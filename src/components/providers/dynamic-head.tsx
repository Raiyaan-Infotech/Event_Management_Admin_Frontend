"use client";

import { useEffect } from "react";
import { usePublicSettings, useSettingsByGroup } from "@/hooks/use-settings";

export function DynamicHead() {
  const { data: publicSettings } = usePublicSettings();
  const { data: appearanceSettings } = useSettingsByGroup("appearance");

  useEffect(() => {
    const adminTitle =
      appearanceSettings?.find((s) => s.key === "admin_title")?.value ||
      publicSettings?.admin_title ||
      publicSettings?.site_title;

    const faviconUrl =
      appearanceSettings?.find((s) => s.key === "admin_favicon_url")?.value ||
      publicSettings?.admin_favicon_url ||
      publicSettings?.favicon_url;

    // Update document title
    if (adminTitle) {
      document.title = adminTitle;
    }

    // Update favicon
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [publicSettings, appearanceSettings]);

  return null;
}

