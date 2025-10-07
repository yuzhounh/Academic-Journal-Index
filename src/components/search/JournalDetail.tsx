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
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Barcode,
  ShieldCheck,
  Globe,
  TrendingUp,
  BookMarked,
  Award,
  DollarSign,
  Search
} from "lucide-react";
import CasPartitionDisplay from "./CasPartitionDisplay";
import { Badge } from "../ui/badge";

interface JournalDetailProps {
  journal: Journal;
  onBack: () => void;
  onJournalSelect: (journalName: string) => void;
}

const formatImpactFactor = (factor: number | string) => {
    const num = Number(factor);
    if (!isNaN(num) && String(factor).trim() !== "" && !String(factor).includes('<')) {
      return num.toFixed(1);
    }
    return factor;
};

const InfoItem = ({ icon: Icon, label, value, isOA }: { icon: React.ElementType, label: string, value: React.ReactNode, isOA?: boolean }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <div className="text-base font-semibold">{value || "-"}</div>
                {isOA && <Badge variant="openAccess">OA</Badge>}
            </div>
        </div>
    </div>
);

const ApcInfoItem = ({ journalName }: { journalName: string }) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(journalName)}+article+processing+charge`;

    return (
        <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">APC</p>
                 <a 
                    href={searchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                    Google <Search className="h-4 w-4"/>
                </a>
            </div>
        </div>
    );
};

const formatIssn = (issn: string) => {
    const parts = issn.split('/');
    if (parts.length > 1) {
        return <>{parts[0]}/<wbr/>{parts.slice(1).join('/')}</>;
    }
    return issn;
};

export default function JournalDetail({ journal, onBack }: JournalDetailProps) {

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
                    <InfoItem icon={Barcode} label="ISSN/EISSN" value={formatIssn(journal.issn)} />
                    <InfoItem icon={ShieldCheck} label="Review" value={journal.review} />
                    <InfoItem icon={BookMarked} label="Web of Science" value={journal.webOfScience} />
                    <InfoItem icon={TrendingUp} label="Impact Factor" value={formatImpactFactor(journal.impactFactor)} />
                    <InfoItem icon={Globe} label="Open Access" value={journal.openAccess} isOA={journal.openAccess === '是'} />
                    {journal.openAccess === '是' && <ApcInfoItem journalName={journal.journalName} />}
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
      </div>
    </div>
  );
}
