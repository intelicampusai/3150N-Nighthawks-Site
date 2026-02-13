'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import TeamDetailClient from './teams/[number]/TeamDetailClient';
import Link from 'next/link';

function NotFoundContent() {
    const pathname = usePathname();

    // Check if the URL matches /teams/[number]
    const teamMatch = pathname?.match(/^\/teams\/([A-Za-z0-9]+)\/?$/);

    if (teamMatch) {
        const teamNumber = teamMatch[1];
        return <TeamDetailClient teamNumber={teamNumber} />;
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-4xl font-bold mb-4">404</h2>
            <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
            <p className="text-muted-foreground mb-8">
                The page you are looking for does not exist.
            </p>
            <Link
                href="/"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
            >
                Return Home
            </Link>
        </div>
    );
}

export default function NotFound() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <NotFoundContent />
        </Suspense>
    );
}
