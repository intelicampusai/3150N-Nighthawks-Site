
import { LibraryBig } from "lucide-react";

export default function LibraryPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
            <div className="p-4 bg-muted rounded-full">
                <LibraryBig className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Resource Library</h1>
            <p className="text-muted-foreground max-w-sm">
                Hero bot designs, rulebooks, and strategy guides for the "Push Back" season are being curated.
            </p>
        </div>
    );
}
