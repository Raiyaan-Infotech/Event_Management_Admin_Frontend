import { HighlightsContent } from "../../../_components/highlights-content";

export const metadata = {
    title: "Highlights Customization | Website Builder",
    description: "Design and customize highlights section",
};

interface PageProps {
    params: Promise<{
        page: string;
        instance: string;
    }>;
}

export default async function HighlightsCustomizationPage({ params }: PageProps) {
    const resolvedParams = await params;
    const pageSlug = resolvedParams.page || 'home';
    const instance = Number(resolvedParams.instance || 1);

    return <HighlightsContent pageSlug={pageSlug} instance={instance} />;
}
