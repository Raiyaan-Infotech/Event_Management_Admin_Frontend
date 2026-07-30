import { UiBlockContent } from "../../_components/ui-block-content";

export const metadata = {
    title: "Web UI Block | Website Builder",
    description: "Manage page UI section sequence and block visibility",
};

interface PageProps {
    params: Promise<{
        page: string;
    }>;
}

export default async function WebUIBlockPageBySlug({ params }: PageProps) {
    const resolvedParams = await params;
    return <UiBlockContent initialPageSlug={resolvedParams.page} />;
}
