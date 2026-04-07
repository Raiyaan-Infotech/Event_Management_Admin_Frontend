"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Pencil, Wrench, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSettingsByGroup,
  useBulkUpdateSettings,
} from "@/hooks/use-settings";
import { useUploadMedia } from "@/hooks/use-media";
import { ImageCropper } from "@/components/common/image-cropper";
import { Can, PermissionGuard } from "@/components/guards/permission-guard";
import { isApprovalRequired } from "@/lib/api-client";
import { HtmlEditor } from "@/components/common/html-editor";
import { PageLoader } from '@/components/common/page-loader';

const fonts = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "opensans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "montserrat", label: "Montserrat" },
  { value: "poppins", label: "Poppins" },
];

export function GeneralSettingsContent() {
  const { data: generalSettings, isLoading: isLoadingGeneral } = useSettingsByGroup("general");
  const { data: appearanceSettings, isLoading: isLoadingAppearance } = useSettingsByGroup("appearance");
  const bulkUpdateGeneralMutation = useBulkUpdateSettings();
  const bulkUpdateAppearanceMutation = useBulkUpdateSettings();
  const uploadMedia = useUploadMedia();

  const isLoading = isLoadingGeneral || isLoadingAppearance;

  // General (maintenance) state
  const [generalValues, setGeneralValues] = useState({
    maintenance_enabled: "false",
    maintenance_html: "",
  });

  // Site settings (appearance) state
  const [siteValues, setSiteValues] = useState({
    site_logo: null as File | null,
    site_logo_url: "",
    admin_logo: null as File | null,
    admin_logo_url: "",
    admin_favicon: null as File | null,
    admin_favicon_url: "",
    login_background: null as File | null,
    login_background_url: "",
    admin_title: "Shopper",
    primary_font: "inter",
    copyright_text: "",
    admin_email: "",
  });

  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const switchPending = isApprovalRequired(bulkUpdateGeneralMutation.error);

  useEffect(() => {
    if (generalSettings) {
      const map: Record<string, string> = {};
      generalSettings.forEach((s) => { map[s.key] = s.value || ""; });
      setGeneralValues({
        maintenance_enabled: map.maintenance_enabled || "false",
        maintenance_html: map.maintenance_html || getDefaultMaintenanceHTML(),
      });
    }
  }, [generalSettings]);

  useEffect(() => {
    if (appearanceSettings) {
      const map: Record<string, string> = {};
      appearanceSettings.forEach((s) => { map[s.key] = s.value || ""; });
      setSiteValues((prev) => ({
        ...prev,
        site_logo_url: map.site_logo_url || "",
        admin_logo_url: map.admin_logo_url || "",
        admin_favicon_url: map.admin_favicon_url || "",
        login_background_url: map.login_background_url || "",
        admin_title: map.admin_title || "Shopper",
        primary_font: map.primary_font || "inter",
        copyright_text: map.copyright_text || "",
        admin_email: map.admin_email || "",
      }));
    }
  }, [appearanceSettings]);

  // ─── Maintenance handlers ──────────────────────────────────────────────────

  const handleSaveGeneral = () => {
    bulkUpdateGeneralMutation.mutate({ group: "general", ...generalValues });
  };

  const handleMaintenanceSave = () => {
    setMaintenanceDialogOpen(false);
  };

  const handleResetToDefault = () => {
    setGeneralValues({ ...generalValues, maintenance_html: getDefaultMaintenanceHTML() });
  };

  // ─── Site settings handlers ────────────────────────────────────────────────

  const handleSiteLogoChange = (file: File) => setSiteValues({ ...siteValues, site_logo: file });
  const handleLogoChange = (file: File) => setSiteValues({ ...siteValues, admin_logo: file });
  const handleFaviconChange = (file: File) => setSiteValues({ ...siteValues, admin_favicon: file });
  const handleBackgroundChange = (file: File) => setSiteValues({ ...siteValues, login_background: file });

  const removeSiteLogo = () => setSiteValues({ ...siteValues, site_logo: null, site_logo_url: "" });
  const removeLogo = () => setSiteValues({ ...siteValues, admin_logo: null, admin_logo_url: "" });
  const removeFavicon = () => setSiteValues({ ...siteValues, admin_favicon: null, admin_favicon_url: "" });
  const removeBackground = () => setSiteValues({ ...siteValues, login_background: null, login_background_url: "" });

  const handleSaveSite = async () => {
    setIsSaving(true);
    try {
      let siteLogoUrl = siteValues.site_logo_url;
      let logoUrl = siteValues.admin_logo_url;
      let faviconUrl = siteValues.admin_favicon_url;
      let backgroundUrl = siteValues.login_background_url;

      if (siteValues.site_logo) {
        const result = await uploadMedia.mutateAsync({ file: siteValues.site_logo, folder: "appearance" });
        siteLogoUrl = result.url;
      }
      if (siteValues.admin_logo) {
        const result = await uploadMedia.mutateAsync({ file: siteValues.admin_logo, folder: "appearance" });
        logoUrl = result.url;
      }
      if (siteValues.admin_favicon) {
        const result = await uploadMedia.mutateAsync({ file: siteValues.admin_favicon, folder: "appearance" });
        faviconUrl = result.url;
      }
      if (siteValues.login_background) {
        const result = await uploadMedia.mutateAsync({ file: siteValues.login_background, folder: "appearance/backgrounds" });
        backgroundUrl = result.url;
      }

      bulkUpdateAppearanceMutation.mutate({
        group: "appearance",
        site_logo_url: siteLogoUrl,
        admin_logo_url: logoUrl,
        admin_favicon_url: faviconUrl,
        login_background_url: backgroundUrl,
        admin_title: siteValues.admin_title,
        primary_font: siteValues.primary_font,
        copyright_text: siteValues.copyright_text,
        admin_email: siteValues.admin_email,
      });

      setSiteValues((prev) => ({
        ...prev,
        site_logo: null, site_logo_url: siteLogoUrl,
        admin_logo: null, admin_logo_url: logoUrl,
        admin_favicon: null, admin_favicon_url: faviconUrl,
        login_background: null, login_background_url: backgroundUrl,
      }));
    } catch {
      // Error toasts handled by mutation hooks
    } finally {
      setIsSaving(false);
    }
  };

  const currentSiteLogoUrl = siteValues.site_logo ? URL.createObjectURL(siteValues.site_logo) : siteValues.site_logo_url;
  const currentLogoUrl = siteValues.admin_logo ? URL.createObjectURL(siteValues.admin_logo) : siteValues.admin_logo_url;
  const currentFaviconUrl = siteValues.admin_favicon ? URL.createObjectURL(siteValues.admin_favicon) : siteValues.admin_favicon_url;
  const currentBackgroundUrl = siteValues.login_background ? URL.createObjectURL(siteValues.login_background) : siteValues.login_background_url;

  return (
    <PermissionGuard permission="settings.view">
      <>
        <PageLoader open={isLoading} />
        <PageLoader open={isSaving || bulkUpdateGeneralMutation.isPending || bulkUpdateAppearanceMutation.isPending} />

        {!isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/settings">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">General Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Configure site settings, logos, and maintenance mode
                </p>
              </div>
            </div>

            {/* ─── Site Settings Section ─────────────────────────────────────── */}

            {/* Site Logo + Admin Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-4">
                    Site Logo
                    {currentSiteLogoUrl && (
                      <a href={siteValues.site_logo_url} target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-primary hover:underline flex items-center gap-1">
                        View full image <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardTitle>
                  <CardDescription>Main logo displayed on your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageCropper
                    title="Site Logo"
                    description="Your main site logo for public pages (160×160 px)"
                    targetWidth={160}
                    targetHeight={160}
                    currentImage={currentSiteLogoUrl}
                    onImageCropped={handleSiteLogoChange}
                    onRemove={removeSiteLogo}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="admin_email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Admin Email
                    </Label>
                    <Input
                      id="admin_email"
                      type="email"
                      placeholder="Enter your admin email"
                      value={siteValues.admin_email}
                      onChange={(e) => setSiteValues({ ...siteValues, admin_email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Primary email address for admin notifications</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favicon | Sidepanel Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-4">
                    Site Favicon
                    {currentFaviconUrl && (
                      <a href={siteValues.admin_favicon_url} target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-primary hover:underline flex items-center gap-1">
                        View full image <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardTitle>
                  <CardDescription>Icon shown in browser tabs and bookmarks (32×32 pixels recommended)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageCropper
                    title="Favicon"
                    description="Browser tab icon (.ico files only)"
                    targetWidth={32}
                    targetHeight={32}
                    accept=".ico"
                    skipCrop
                    currentImage={currentFaviconUrl}
                    onImageCropped={handleFaviconChange}
                    onRemove={removeFavicon}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-4">
                    Sidepanel Settings
                    {currentLogoUrl && (
                      <a href={siteValues.admin_logo_url} target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-primary hover:underline flex items-center gap-1">
                        View full image <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardTitle>
                  <CardDescription>Configure sidebar logo and admin title</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageCropper
                    title="Sidepanel Logo"
                    description="Logo shown in admin sidebar (150×50 px)"
                    targetWidth={150}
                    targetHeight={50}
                    currentImage={currentLogoUrl}
                    onImageCropped={handleLogoChange}
                    onRemove={removeLogo}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="admin_title">Admin Title</Label>
                    <Input
                      id="admin_title"
                      type="text"
                      value={siteValues.admin_title}
                      onChange={(e) => setSiteValues({ ...siteValues, admin_title: e.target.value })}
                      placeholder="Enter your admin title"
                    />
                    <p className="text-xs text-muted-foreground">Title shown in browser tab</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Primary Font | Copyright */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Font</CardTitle>
                  <CardDescription>Font family for the admin panel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={siteValues.primary_font}
                      onValueChange={(val) => setSiteValues({ ...siteValues, primary_font: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Copyright</CardTitle>
                  <CardDescription>Copyright text displayed in the footer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="copyright_text">Copyright Text</Label>
                    <Input
                      id="copyright_text"
                      type="text"
                      value={siteValues.copyright_text}
                      onChange={(e) => setSiteValues({ ...siteValues, copyright_text: e.target.value })}
                      placeholder="Enter your copyright text"
                    />
                    <p className="text-xs text-muted-foreground">This text will appear in the footer of your site</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Login Screen Background */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-4">
                  Login Screen Background
                  {currentBackgroundUrl && (
                    <a href={siteValues.login_background_url} target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-primary hover:underline flex items-center gap-1">
                      View full image <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardTitle>
                <CardDescription>Upload a background image for the login screen</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageCropper
                  title="Login Background"
                  description="Background image displayed on the login page"
                  targetWidth={1920}
                  targetHeight={1080}
                  currentImage={currentBackgroundUrl}
                  onImageCropped={handleBackgroundChange}
                  onRemove={removeBackground}
                />
              </CardContent>
            </Card>

            {/* Save Site Settings */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSite} isLoading={isSaving || bulkUpdateAppearanceMutation.isPending} size="lg">
                <Save className="mr-2 h-4 w-4" />
                Save Site Settings
              </Button>
            </div>

            {/* ─── Maintenance Mode Section ───────────────────────────────────── */}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  System Maintenance Mode
                </CardTitle>
                <CardDescription>Show a maintenance page while performing system updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={generalValues.maintenance_enabled === "true"}
                      pending={switchPending}
                      onCheckedChange={(checked) =>
                        setGeneralValues({ ...generalValues, maintenance_enabled: checked ? "true" : "false" })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {switchPending
                        ? "Pending approval..."
                        : generalValues.maintenance_enabled === "true"
                          ? "Site is under maintenance"
                          : "Site is operating normally"}
                    </span>
                  </div>
                  <Can permission="general_settings.edit">
                    <Button variant="outline" size="sm" onClick={() => setMaintenanceDialogOpen(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Can>
                </div>
              </CardContent>
            </Card>

            {/* Save Maintenance Settings */}
            <Can permission="general_settings.edit">
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} isLoading={bulkUpdateGeneralMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Maintenance Settings
                </Button>
              </div>
            </Can>
          </div>
        )}

        {/* Maintenance Mode Edit Dialog */}
        <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Edit Maintenance Page
              </DialogTitle>
              <DialogDescription>
                Customize the HTML content that will be displayed during system maintenance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label>Status:</Label>
                <Switch
                  checked={generalValues.maintenance_enabled === "true"}
                  pending={switchPending}
                  onCheckedChange={(checked) =>
                    setGeneralValues({ ...generalValues, maintenance_enabled: checked ? "true" : "false" })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {switchPending ? "Pending approval..." : generalValues.maintenance_enabled === "true" ? "Active" : "Disabled"}
                </span>
              </div>

              <HtmlEditor
                value={generalValues.maintenance_html}
                onChange={(value) => setGeneralValues({ ...generalValues, maintenance_html: value })}
                label="Maintenance Page HTML"
                placeholder="Enter your HTML content here..."
                rows={14}
                helpText="You can use HTML, CSS (inline or in style tags), and basic styling"
                showResetButton={true}
                onReset={handleResetToDefault}
                resetButtonText="Reset to Default"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setMaintenanceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleMaintenanceSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </PermissionGuard>
  );
}

function getDefaultMaintenanceHTML() {
  return `<div style="text-align: center; max-width: 600px; margin: 0 auto;">
  <div style="margin-bottom: 2rem;">
    <div style="display: inline-block; background: rgba(234, 179, 8, 0.1); padding: 1.5rem; border-radius: 50%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgb(234, 179, 8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    </div>
  </div>

  <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem; color: inherit;">
    Under Maintenance
  </h1>

  <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
    We're currently performing scheduled maintenance. We'll be back shortly!
  </p>

  <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #6b7280; margin-bottom: 2rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <span>Please check back soon</span>
  </div>
</div>`;
}
