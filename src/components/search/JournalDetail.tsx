"use client";

import type { Journal } from "@/data/journals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Barcode,
  ShieldCheck,
  Globe,
  CheckCircle,
  TrendingUp,
  Award,
  BookMarked,
  Sparkles,
} from "lucide-react";
import CasPartitionDisplay from "./CasPartitionDisplay";
import AiSummary from "./AiSummary";

interface JournalDetailProps {
  journal: Journal;
  onBack: () => void;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base font-semibold">{value || "-"}</p>
        </div>
    </div>
);


export default function JournalDetail({ journal, onBack }: JournalDetailProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} aria-label="Back to search results">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">{journal.journalName}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <Sparkles className="text-primary"/>
                    AI-Powered Summary
                </CardTitle>
                <CardDescription>A concise summary of the journal's significance and impact.</CardDescription>
            </CardHeader>
            <CardContent>
                <AiSummary journal={journal} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <BookOpen className="text-primary"/>
                    Basic Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoItem icon={CalendarDays} label="Year" value={journal.year} />
                <InfoItem icon={Barcode} label="ISSN/EISSN" value={journal.issn} />
                <InfoItem icon={ShieldCheck} label="Peer-Reviewed" value={journal.review} />
                <InfoItem icon={CheckCircle} label="OA Journal Index (OAJ)" value={journal.oaj} />
                <InfoItem icon={Globe} label="Open Access" value={journal.openAccess} />
                <InfoItem icon={BookMarked} label="Web of Science" value={journal.webOfScience} />
            </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <TrendingUp className="text-primary"/>
                        Impact Factor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-primary">{journal.impactFactor}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Award className="text-primary"/>
                        Authority Level
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-semibold">{journal.authorityJournal}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <BookMarked className="text-primary"/>
                    CAS Partition
                </CardTitle>
                <CardDescription>Chinese Academy of Sciences (CAS) journal ranking.</CardDescription>
            </CardHeader>
            <CardContent>
                <CasPartitionDisplay journal={journal} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
