import { HeroSectionContent } from "../_components/hero-section-content";

export const metadata = {
    title: "Hero Section | Website Builder",
    description: "Configure main hero banner title, eyebrow, description, CTA buttons, and background overlay",
};

interface PageProps {
    searchParams?: Promise<{ page?: string }>;
}

export default async function HeroSectionPage({ searchParams }: PageProps) {
    const resolvedParams = searchParams ? await searchParams : {};
    const pageSlug = resolvedParams.page || 'home';
    return <HeroSectionContent pageSlug={pageSlug} />;
}
