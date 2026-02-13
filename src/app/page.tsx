
import { getTeams, getEvents } from "@/lib/api";
import { TeamCard } from "@/components/dashboard/TeamCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
    const teams = await getTeams();
    const events = await getEvents();
    const topTeams = teams.slice(0, 4); // Top 4 for dashboard
    const upcomingEvents = events.slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Section: The "Now" */}
            <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight">Happening Now</h2>
                    <Link href="/events" className="text-sm text-primary flex items-center">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>

            {/* Section: Top Teams */}
            <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight">Top Performers</h2>
                    <Link href="/teams" className="text-sm text-primary flex items-center">
                        Rankings <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {topTeams.map(team => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </div>
            </section>
        </div>
    );
}
