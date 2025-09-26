"use client";

import type { Journal } from "@/data/journals";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Barcode,
  ShieldCheck,
  Globe,
  CheckCircle,
  TrendingUp,
  BookMarked,
  Sparkles,
  Award,
  DollarSign
} from "lucide-react";
import CasPartitionDisplay from "./CasPartitionDisplay";
import AiSummary from "./AiSummary";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

interface JournalDetailProps {
  journal: Journal;
  onBack: () => void;
  onJournalSelect: (journalName: string) => void;
}

const formatImpactFactor = (factor: number | string) => {
    const num = Number(factor);
    if (!isNaN(num)) {
      return num.toFixed(1);
    }
    return factor;
};

const InfoItem = ({ icon: Icon, label, value, isOA }: { icon: React.ElementType, label: string, value: string | number, isOA?: boolean }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-base font-semibold">{value || "-"}</p>
                {isOA && <Badge variant="openAccess">OA</Badge>}
            </div>
        </div>
    </div>
);

const ApcInfoItem = ({ apc }: { apc: { value: string | undefined, url: string | undefined } }) => {
    const renderContent = () => {
        if (apc.value === undefined) {
            // Loading state
            return <Skeleton className="h-5 w-20" />;
        }
        if (apc.value === "Error" || apc.value === "Not found") {
            return <p className="text-base font-semibold text-muted-foreground">{apc.value}</p>;
        }
        
        return (
            <a 
                href={apc.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-base font-semibold text-primary hover:underline"
            >
                {apc.value}
            </a>
        );
    };

    return (
        <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">APC</p>
                <div className="flex items-center gap-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


export default function JournalDetail({ journal, onBack, onJournalSelect }: JournalDetailProps) {
  const [apc, setApc] = useState<{ value: string | undefined, url: string | undefined }>({ value: undefined, url: undefined });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} aria-label="Back to search results">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">{journal.journalName}</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <BookOpen className="text-primary"/>
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoItem icon={CalendarDays} label="Year" value={journal.year} />
                    <InfoItem icon={Barcode} label="ISSN/EISSN" value={journal.issn} />
                    <InfoItem icon={ShieldCheck} label="Review" value={journal.review} />
                    <InfoItem icon={BookMarked} label="Web of Science" value={journal.webOfScience} />
                    <InfoItem icon={TrendingUp} label="Impact Factor" value={formatImpactFactor(journal.impactFactor)} />
                    <InfoItem icon={Globe} label="Open Access" value={journal.openAccess} isOA={journal.openAccess === '是'} />
                    {journal.openAccess === '是' && <ApcInfoItem apc={apc} />}
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Award className="text-primary"/>
                        CAS Partition
                    </CardTitle>
                    <CardDescription>Chinese Academy of Sciences (CAS) journal ranking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CasPartitionDisplay journal={journal} />
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <Sparkles className="text-primary"/>
                    AI-Powered Summary
                </CardTitle>
                <CardDescription>A concise summary of the journal's significance and impact.</CardDescription>
            </CardHeader>
            <CardContent>
                <AiSummary journal={journal} onJournalSelect={onJournalSelect} setApc={setApc} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
