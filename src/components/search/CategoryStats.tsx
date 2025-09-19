"use client";

import { useMemo } from "react";
import type { Journal } from "@/data/journals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface CategoryStatsProps {
  journals: Journal[];
}

const partitionColors: { [key: string]: string } = {
  "1": "hsl(var(--chart-1))", // Reddish
  "2": "hsl(var(--chart-2))", // Orangish
  "3": "hsl(var(--chart-3))", // Yellowish
  "4": "hsl(var(--chart-4))", // Greenish
};

const authorityColors: { [key: string]: string } = {
  "一级": "hsl(var(--chart-1))",
  "二级": "hsl(var(--chart-2))",
  "三级": "hsl(var(--chart-3))",
};


const StatsDisplay = ({ title, data, total }: { title: string; data: { name: string; count: number }[]; total: number }) => {
    
    if (total === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
            <div className="space-y-2 text-sm">
                {data.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.name in partitionColors ? partitionColors[item.name.charAt(0)] : authorityColors[item.name] }} />
                           <span>{item.name}</span>
                        </div>
                        <div className="font-mono text-right">
                           <span>{item.count}</span>
                           <span className="text-muted-foreground text-xs ml-2">({((item.count / total) * 100).toFixed(1)}%)</span>
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
      if (p === "1") counts["一区"]++;
      else if (p === "2") counts["二区"]++;
      else if (p === "3") counts["三区"]++;
      else if (p === "4") counts["四区"]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: partitionColors[name.charAt(1)] }));
  }, [journals]);

  const authorityData = useMemo(() => {
    const counts: { [key: string]: number } = { "一级": 0, "二级": 0, "三级": 0 };
    journals.forEach((j) => {
      if (j.authorityJournal === "一级") counts["一级"]++;
      else if (j.authorityJournal === "二级") counts["二级"]++;
      else if (j.authorityJournal === "三级") counts["三级"]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: authorityColors[name] }));
  }, [journals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">Category Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Journals</p>
            <p className="text-4xl font-bold">{totalJournals}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                 <StatsDisplay title="CAS Partition Breakdown" data={partitionData.map(p => ({...p, name: p.name}))} total={totalJournals} />
            </div>
            <div>
                 <StatsDisplay title="Authority Level Breakdown" data={authorityData.map(a => ({...a, name: a.name}))} total={totalJournals} />
            </div>
        </div>

        <div className="space-y-4 pt-4">
            <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">CAS Partition Distribution</h4>
                <div className="w-full h-10 flex rounded-md overflow-hidden">
                    {partitionData.map((item, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                width: `${(item.count / totalJournals) * 100}%`,
                                backgroundColor: item.name in partitionColors ? partitionColors[item.name.charAt(0)] : authorityColors[item.name],
                             }}
                             className="h-full"
                        />
                    ))}
                </div>
            </div>
             <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Authority Level Distribution</h4>
                <div className="w-full h-10 flex rounded-md overflow-hidden">
                    {authorityData.map((item, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                width: `${(item.count / totalJournals) * 100}%`,
                                backgroundColor: authorityColors[item.name],
                             }}
                             className="h-full"
                        />
                    ))}
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
