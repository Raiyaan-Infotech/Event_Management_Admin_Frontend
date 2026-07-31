import { HeroSectionContent } from "../../_components/hero-section-content";

export const metadata = {
    title: "Hero Section | Website Builder",
    description: "Configure main hero banner title, eyebrow, description, CTA buttons, and background overlay",
};

interface PageProps {
    params: Promise<{
        page: string;
    }>;
}

export default async function HeroSectionPageBySlug({ params }: PageProps) {
    const resolvedParams = await params;
    return <HeroSectionContent pageSlug={resolvedParams.page} />;
}
