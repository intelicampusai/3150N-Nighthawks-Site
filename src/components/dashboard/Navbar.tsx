"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const routes = [
        { href: "/", label: "Home" },
        { href: "/events", label: "Events" },
        { href: "/teams", label: "Teams" },
        { href: "/library", label: "Library" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 md:px-8 max-w-7xl mx-auto">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Box className="h-6 w-6 text-primary" />
                    <span className="hidden font-bold sm:inline-block">
                        VEX V5 Hub
                    </span>
                    <span className="font-bold sm:hidden">
                        V5 Hub
                    </span>
                </Link>

                <nav className="flex items-center space-x-6 text-sm font-medium mr-auto hidden md:flex">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === route.href || (route.href !== "/" && pathname?.startsWith(route.href))
                                    ? "text-foreground"
                                    : "text-foreground/60"
                            )}
                        >
                            {route.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">
                        Season: 2025-26
                    </div>
                </div>
            </div>
        </header>
    );
}
