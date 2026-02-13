import Link from "next/link";
import { Box } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center pl-4 pr-4">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Box className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">
                        VEX V5 Hub
                    </span>
                    <span className="font-bold sm:hidden">
                        V5 Hub
                    </span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search Placeholder */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">
                            Season: 2025-26
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
