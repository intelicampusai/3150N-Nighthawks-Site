'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from "next/navigation";
import { getTeam, getMatches } from "@/lib/api";
import { Team, Match } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ArrowLeft, Trophy, Target, Code2, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TeamDetailClientProps {
    teamNumber?: string;
}

export default function TeamDetailClient({ teamNumber }: TeamDetailClientProps) {
    const params = useParams();
    const number = teamNumber || (params?.number as string);

    const [team, setTeam] = useState<Team | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!number) return;

            try {
                setLoading(true);
                const teamData = await getTeam(number);

                if (!teamData) {
                    setError(true);
                    return;
                }

                setTeam(teamData);

                // Fetch matches separately to not block UI
                const matchesData = await getMatches(number);
                setMatches(matchesData);
            } catch (err) {
                console.error("Error fetching team data:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [number]);



    if (loading) {
        return (
            <div className="space-y-6 pb-10 animate-pulse">
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-10 w-32 bg-muted rounded"></div>
                        <div className="h-6 w-64 bg-muted rounded"></div>
                        <div className="h-4 w-48 bg-muted rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-32 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
                <p className="text-muted-foreground mb-6">Could not find team {number}</p>
                <Button asChild>
                    <Link href="/teams">Return to Teams</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/teams" className="hover:text-primary flex items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Rankings
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{team.number}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{team.number}</h1>
                    <p className="text-xl text-muted-foreground">{team.name}</p>
                    <p className="text-sm opacity-70">{team.organization} • {team.region}, {team.country}</p>
                </div>
                <div className="flex space-x-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        {team.grade}
                    </Badge>
                    {team.stats && (
                        <Badge className="text-sm px-3 py-1">
                            Rank {team.stats.rank}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <Trophy className="mr-2 h-4 w-4 text-yellow-500" /> Season record
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">
                            {team.stats?.wins || 0} - {team.stats?.losses || 0} - {team.stats?.ties || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {team.stats?.total_matches ? ((team.stats.wins / team.stats.total_matches) * 100).toFixed(1) : "0.0"}% Win Rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <Target className="mr-2 h-4 w-4 text-blue-500" /> Skills Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.skills?.combined_score || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            World Rank: #{team.skills?.rank || "N/A"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                            <Code2 className="mr-2 h-4 w-4 text-purple-500" /> Programming
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.skills?.programming_score || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Driver: {team.skills?.driver_score || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Match History Grouped by Competition */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight px-1">Competition History</h2>
                {matches.length > 0 ? (
                    (() => {
                        // Group matches by event
                        const groups: { [key: string]: { name: string; matches: Match[] } } = {};
                        matches.forEach(match => {
                            const eventId = match.event?.id || 0;
                            const eventName = match.event?.name || "Unknown Competition";
                            const key = `${eventId}-${eventName}`;
                            if (!groups[key]) {
                                groups[key] = { name: eventName, matches: [] };
                            }
                            groups[key].matches.push(match);
                        });

                        // Sort matches within each group: Latest rounds/numbers first
                        Object.values(groups).forEach(group => {
                            group.matches.sort((a, b) => {
                                const getRoundPriority = (r: number) => {
                                    if (r === 5) return 100; // Finals
                                    if (r === 4) return 80;  // Semi-finals
                                    if (r === 3) return 60;  // Quarter-finals
                                    if (r === 6) return 40;  // R16
                                    if (r === 2) return 20;  // Quals
                                    return r;
                                };

                                const pA = getRoundPriority(a.round);
                                const pB = getRoundPriority(b.round);

                                if (pA !== pB) return pB - pA;
                                if (a.instance !== b.instance) return (b.instance || 0) - (a.instance || 0);
                                return (b.matchnum || 0) - (a.matchnum || 0);
                            });
                        });

                        return Object.entries(groups).map(([key, group]) => (
                            <MatchGroup
                                key={key}
                                eventName={group.name}
                                matches={group.matches}
                                teamNumber={team.number}
                            />
                        ));
                    })()
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            No matches found for this team.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function MatchGroup({ eventName, matches, teamNumber }: { eventName: string; matches: Match[]; teamNumber: string }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Card className="overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
            >
                <div className="flex items-center space-x-3 text-left">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold leading-none">{eventName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{matches.length} Matches</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>

            <div className={cn("transition-all", !isOpen && "hidden")}>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Match</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>Alliances</TableHead>
                                <TableHead className="text-right">Video</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matches.map((match) => {
                                const isRed = match.alliances.red.teams.some(t => t.team.name === teamNumber);
                                const myScore = isRed ? match.alliances.red.score : match.alliances.blue.score;
                                const oppScore = isRed ? match.alliances.blue.score : match.alliances.red.score;
                                const isWin = myScore > oppScore;
                                const isTie = myScore === oppScore;

                                // Format match name correctly
                                let matchLabel = match.name || "";
                                if (match.round === 2) {
                                    matchLabel = `Q${match.matchnum}`;
                                } else if (matchLabel.includes('#')) {
                                    matchLabel = matchLabel.replace('#', '');
                                } else {
                                    // Fallback mapping if name is missing
                                    const roundMap: { [key: number]: string } = {
                                        3: 'QF',
                                        4: 'SF',
                                        5: 'F',
                                        6: 'R16'
                                    };
                                    matchLabel = `${roundMap[match.round] || `R${match.round}`} ${match.instance}-${match.matchnum}`;
                                }

                                return (
                                    <TableRow key={match.id}>
                                        <TableCell className="font-medium font-mono text-xs whitespace-nowrap">
                                            {matchLabel}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={isWin ? "default" : isTie ? "outline" : "destructive"} className="font-mono text-[10px] px-1.5 py-0">
                                                {isWin ? "WIN" : isTie ? "TIE" : "LOSS"} {myScore}-{oppScore}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            <div className="flex flex-col space-y-1">
                                                <div className={cn("px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300", isRed && "ring-1 ring-red-500 font-bold")}>
                                                    {match.alliances.red.teams.map(t => t.team.name).join(", ")}
                                                </div>
                                                <div className={cn("px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", !isRed && "ring-1 ring-blue-500 font-bold")}>
                                                    {match.alliances.blue.teams.map(t => t.team.name).join(", ")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {match.video_url ? (
                                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                    <Link href={match.video_url} target="_blank">
                                                        <Video className="h-4 w-4 text-primary" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-[10px] italic">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    );
}
