
"use client";

import { useMemo } from "react";
import type { Journal } from "@/data/journals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


interface CategoryStatsProps {
  journals: Journal[];
}

const partitionMap: { [key: string]: string } = {
    "1": "一区",
    "2": "二区",
    "3": "三区",
    "4": "四区",
};

const partitionColors: { [key: string]: string } = {
  "一区": "#ef4444",
  "二区": "#f97316",
  "三区": "#eab308",
  "四区": "#22c55e",
};

const authorityColors: { [key: string]: string } = {
  "一级": "#f75c2e",
  "二级": "#f79410",
  "三级": "#22c55e",
};

const openAccessColors: { [key: string]: string } = {
    "Open Access": "#34d399",
    "Closed Access": "#d1d5db",
};

const StatsBarChart = ({ data, totalJournals }: { data: { name: string; count: number, fill: string }[]; totalJournals: number }) => {
    if (!data.length || totalJournals === 0) return <div className="h-8 bg-muted rounded-md" />;

    return (
        <TooltipProvider>
            <div className="flex h-8 w-full rounded-md overflow-hidden">
                {data.map((item) => (
                    <Tooltip key={item.name} delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div
                                style={{
                                    width: `${(item.count / totalJournals) * 100}%`,
                                    backgroundColor: item.fill,
                                }}
                                className="h-full transition-transform duration-200 ease-in-out hover:scale-105 hover:brightness-110"
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm p-1">
                                <p className="font-bold flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                                    {item.name}
                                </p>
                                <p>数量: {item.count}</p>
                                <p>比例: {((item.count / totalJournals) * 100).toFixed(1)}%</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};


const StatsDetails = ({ title, data, total }: { title: string; data: { name: string; count: number, fill: string }[]; total: number }) => {
    
    if (total === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-base font-semibold text-muted-foreground">{title}</h4>
            <div className="space-y-2 text-base">
                {data.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                           <span>{item.name}</span>
                        </div>
                        <div className="font-mono text-right">
                           <span>{item.count}</span>
                           <span className="text-muted-foreground text-sm ml-2">({((item.count / total) * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function CategoryStats({ journals }: CategoryStatsProps) {
  const totalJournals = journals.length;

  const partitionData = useMemo(() => {
    const counts: { [key: string]: number } = { "一区": 0, "二区": 0, "三区": 0, "四区": 0 };
    journals.forEach((j) => {
      const p = j.majorCategoryPartition.charAt(0);
      const partitionName = partitionMap[p];
      if (partitionName) {
          counts[partitionName]++;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: partitionColors[name] })).filter(item => item.count > 0);
  }, [journals]);

  const authorityData = useMemo(() => {
    const counts: { [key: string]: number } = { "一级": 0, "二级": 0, "三级": 0 };
    journals.forEach((j) => {
      if (counts.hasOwnProperty(j.authorityJournal)) {
        counts[j.authorityJournal]++;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: authorityColors[name] })).filter(item => item.count > 0);
  }, [journals]);

  const openAccessData = useMemo(() => {
    const counts = { "Open Access": 0, "Closed Access": 0 };
    journals.forEach((j) => {
      if (j.openAccess === "是") {
        counts["Open Access"]++;
      } else {
        counts["Closed Access"]++;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, fill: openAccessColors[name] }))
      .filter(item => item.count > 0);
  }, [journals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">Category Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <p className="text-base text-muted-foreground">Total Journals</p>
            <p className="text-4xl font-bold">{totalJournals}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <StatsDetails title="CAS Partition Breakdown" data={partitionData} total={totalJournals} />
            <StatsDetails title="Authority Level Breakdown" data={authorityData} total={totalJournals} />
            <StatsDetails title="Open Access Breakdown" data={openAccessData} total={totalJournals} />

            <div className="space-y-2">
                <StatsBarChart data={partitionData} totalJournals={totalJournals} />
            </div>
            <div className="space-y-2">
                <StatsBarChart data={authorityData} totalJournals={totalJournals} />
            </div>
            <div className="space-y-2">
                <StatsBarChart data={openAccessData} totalJournals={totalJournals} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
