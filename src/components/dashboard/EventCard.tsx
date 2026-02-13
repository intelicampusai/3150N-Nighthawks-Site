
import { Event } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarClock } from "lucide-react";

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const isLive = event.status === 'active';
    const startDate = new Date(event.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endDate = new Date(event.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                        {event.name}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {event.location.city}, {event.location.region}
                    </div>
                </div>
                {isLive ? (
                    <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                ) : (
                    <Badge variant="outline" className="text-xs">{startDate} - {endDate}</Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="mt-2 text-xs font-medium text-muted-foreground uppercase">
                    Capacity
                </div>
                <div className="mt-1 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary"
                        style={{ width: `${((event.capacity?.current || 0) / (event.capacity?.max || 1)) * 100}%` }}
                    />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{event.capacity?.current || 0} Teams</span>
                    <span>{event.capacity?.max || 0} Max</span>
                </div>
            </CardContent>
        </Card>
    );
}
