import TeamDetailClient from "./TeamDetailClient";

// Required for output: export
export function generateStaticParams() {
    return [{ number: '3150N' }];
}

export const dynamicParams = false;

export default function TeamDetailPage() {
    return <TeamDetailClient />;
}
