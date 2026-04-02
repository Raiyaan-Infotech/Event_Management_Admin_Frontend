"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  Menu,
  Building2,
  Users,
  Megaphone,
  HelpCircle,
  FileQuestion,
  Image,
  CreditCard,
  Store,
  Package,
  Calendar,
  BarChart2,
  MessageSquare,
  Bell,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSettingsByGroup } from "@/hooks/use-settings";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissionCheck } from "@/hooks";
import { usePlugins } from "@/hooks/use-plugins";
import { PageLoader } from "@/components/common/page-loader";

interface MenuItem {
  labelKey: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
  permission?: string;
  minLevel?: number;
  developerOnly?: boolean;
  pluginSlug?: string; // if set, item is hidden when plugin is inactive
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    labelKey: "nav.dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    labelKey: "nav.companies",
    href: "/admin/companies",
    icon: Building2,
    developerOnly: true,
  },
  {
    labelKey: "nav.vendors",
    href: "/admin/vendors",
    icon: Store,
    permission: "vendors.view",
  },
  {
    labelKey: "nav.employees",
    href: "/admin/platform/users",
    icon: Users,
    permission: "employees.view",
  },
  {
    labelKey: "nav.events",
    icon: Calendar,
    children: [
      { labelKey: "nav.menus", href: "/admin/menus", icon: Menu, permission: "menus.view" },
    ],
  },
  {
    labelKey: "nav.reports",
    href: "/admin/reports",
    icon: BarChart2,
    permission: "reports.view",
  },
  {
    labelKey: "nav.marketing",
    icon: Megaphone,
    children: [
      { labelKey: "nav.media", href: "/admin/media", icon: Image, permission: "media.view" },
    ],
  },
  {
    labelKey: "nav.communication",
    icon: MessageSquare,
    children: [
      { labelKey: "nav.notifications", href: "/admin/notifications", icon: Bell, permission: "notifications.view" },
      { labelKey: "nav.mail", href: "/admin/mail", icon: Mail, permission: "mail.view" },
      { labelKey: "nav.support", href: "/admin/support", icon: MessageCircle, permission: "support.view" },
      { labelKey: "nav.contact", href: "/admin/contact", icon: Phone, permission: "contact.view" },
    ],
  },
  {
    labelKey: "nav.subscriptions",
    href: "/admin/subscriptions",
    icon: Package,
    permission: "subscriptions.view",
  },
  {
    labelKey: "nav.faqs",
    icon: HelpCircle,
    permission: "faqs.view",
    pluginSlug: "faq",
    children: [
      { labelKey: "nav.faq_list", href: "/admin/faqs", icon: HelpCircle, permission: "faqs.view" },
      { labelKey: "nav.faq_categories", href: "/admin/faq-categories", icon: FileQuestion, permission: "faq_categories.view" },
    ],
  },
  {
    labelKey: "nav.payments",
    href: "/admin/payments",
    icon: CreditCard,
    permission: "payments.view",
    badge: "Coming Soon",
  },
  {
    labelKey: "nav.settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings.view",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: settings } = useSettingsByGroup("appearance");

  const adminTitle =
    settings?.find((s) => s.key === "admin_title")?.value || "Admin Panel";
  const adminLogoUrl =
    settings?.find((s) => s.key === "admin_logo_url")?.value || "";
  const logoHeight =
    settings?.find((s) => s.key === "logo_height")?.value || "40";

  const isActive = (href?: string) =>
    !!(href && (href === "/admin" ? pathname === href : pathname.startsWith(href)));
  const isChildActive = (children?: MenuItem[]) =>
    children?.some((child) => child.href && pathname.startsWith(child.href));

  // Use shared permission check hook
  const { hasPermission, isDeveloper, hasMinLevel } = usePermissionCheck();
  const isLoading = !user;

  // Plugin active state
  const { data: pluginsData } = usePlugins();
  const activePluginSlugs = new Set(
    (pluginsData?.plugins ?? []).filter((p) => p.is_active === 1).map((p) => p.slug)
  );

  // Filter menu items based on permissions + plugin state
  const filterMenuItem = (item: MenuItem): boolean => {
    // Developer-only items
    if (item.developerOnly && !isDeveloper()) {
      return false;
    }

    // Level check
    if (!hasMinLevel(item.minLevel)) {
      return false;
    }

    // Permission check
    if (!hasPermission(item.permission)) {
      return false;
    }

    // Plugin check — only hide if plugins are loaded AND plugin is explicitly inactive
    if (item.pluginSlug && pluginsData && !activePluginSlugs.has(item.pluginSlug)) {
      return false;
    }

    return true;
  };

  // Filter children and check if parent should be shown
  const getVisibleChildren = (children?: MenuItem[]): MenuItem[] => {
    if (!children) return [];
    return children.filter(filterMenuItem);
  };

  // Filter menu items
  const visibleMenuItems = menuItems.filter((item) => {
    if (!filterMenuItem(item)) return false;

    // If item has children, check if any children are visible
    if (item.children) {
      const visibleChildren = getVisibleChildren(item.children);
      return visibleChildren.length > 0;
    }

    return true;
  });

  return (
    <>
      <PageLoader open={isLoading} text={t("common.loading", "Loading...")} />

      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href="/admin"
                className="flex flex-col items-center gap-2 px-2 py-4"
              >
                {adminLogoUrl ? (
                  <>
                    <img
                      src={adminLogoUrl}
                      alt={adminTitle}
                      style={{ height: `${logoHeight}px` }}
                      className="max-w-full object-contain"
                    />
                    <span className="font-semibold text-lg text-center">
                      {adminTitle}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        {adminTitle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-lg text-center">
                      {adminTitle}
                    </span>
                  </>
                )}
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.navigation")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => {
                  const visibleChildren = getVisibleChildren(item.children);

                  if (visibleChildren.length > 0) {
                    return (
                      <Collapsible
                        key={item.labelKey}
                        defaultOpen={isChildActive(visibleChildren)}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon className="w-4 h-4" />
                              <span>{t(item.labelKey)}</span>
                              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {visibleChildren.map((child) => (
                                <SidebarMenuSubItem key={child.labelKey}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(child.href)}
                                  >
                                    <a href={child.href || "#"} className="flex items-center gap-2">
                                      <child.icon className="h-4 w-4 shrink-0" />
                                      <span className="truncate">{t(child.labelKey)}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.labelKey}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <a href={item.href || "#"} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t(item.labelKey)}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}