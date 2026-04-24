import ThemeBuilderWrapper from "./_components/theme-builder-wrapper";

export const metadata = {
  title: "Theme Builder — Admin Portal",
  description: "Select and build layouts for your themes",
};

export default function ThemeBuilderPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Theme Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a theme from the dropdown to design its visual layout blocks.
        </p>
      </div>

      <ThemeBuilderWrapper />
    </div>
  );
}
