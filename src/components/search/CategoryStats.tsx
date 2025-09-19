
"use client";

import { useMemo } from "react";
import type { Journal } from "@/data/journals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

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


const StatsChart = ({ title, data, total }: { title: string; data: { name: string; count: number, fill: string }[]; total: number }) => {
    
    if (total === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
            <div className="space-y-2 text-sm">
                {data.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
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
                 <StatsChart title="CAS Partition Breakdown" data={partitionData} total={totalJournals} />
            </div>
            <div>
                 <StatsChart title="Authority Level Breakdown" data={authorityData} total={totalJournals} />
            </div>
        </div>

        <div className="space-y-4 pt-4">
            {partitionData.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">CAS Partition Distribution</h4>
                    <div className="w-full h-10 flex rounded-md overflow-hidden">
                        {partitionData.map((item, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    width: `${(item.count / totalJournals) * 100}%`,
                                    backgroundColor: item.fill,
                                 }}
                                 className="h-full"
                            />
                        ))}
                    </div>
                </div>
            )}
             {authorityData.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Authority Level Distribution</h4>
                    <div className="w-full h-10 flex rounded-md overflow-hidden">
                        {authorityData.map((item, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    width: `${(item.count / totalJournals) * 100}%`,
                                    backgroundColor: item.fill,
                                 }}
                                 className="h-full"
                            />
                        ))}
                    </div>
                </div>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
