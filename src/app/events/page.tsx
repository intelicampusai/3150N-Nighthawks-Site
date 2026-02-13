
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EventsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Under Construction</AlertTitle>
                <AlertDescription>
                    The events calendar and map view are coming soon.
                </AlertDescription>
            </Alert>
        </div>
    );
}
