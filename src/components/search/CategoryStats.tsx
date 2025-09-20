
"use client";

import { useMemo } from "react";
import type { Journal } from "@/data/journals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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


const CustomTooltip = ({ active, payload, totalJournals }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const key = payload[0].dataKey;
    const count = data[key];

    // Find the original item to get the fill color and correct name
    const originalItem = (payload[0].payload.chartData as any[]).find(item => item.name === key);
    const color = originalItem ? originalItem.fill : '#8884d8';

    if (count === undefined || !originalItem) return null;

    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg text-sm">
        <p className="font-bold" style={{ color }}>{key}</p>
        <p>数量: {count}</p>
        <p>比例: {((count / totalJournals) * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const StatsBarChart = ({ data, totalJournals }: { data: { name: string; count: number, fill: string }[]; totalJournals: number }) => {
    if (!data.length || totalJournals === 0) return <div className="h-[50px] bg-muted rounded-md" />;

    const chartData = [{ 
      name: 'stats', 
      ...data.reduce((acc, item) => ({...acc, [item.name]: item.count }), {}),
      chartData: data // Pass original data for tooltip to find name and color
    }];

    return (
        <div style={{ width: '100%', height: 50 }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={chartData}
              stackOffset="expand"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={<CustomTooltip totalJournals={totalJournals} />} cursor={{ fill: 'hsl(var(--muted))' }} />
              {data.map((item, index) => (
                  <Bar key={index} dataKey={item.name} stackId="a" fill={item.fill} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <StatsDetails title="CAS Partition Breakdown" data={partitionData} total={totalJournals} />
            <StatsDetails title="Authority Level Breakdown" data={authorityData} total={totalJournals} />

            <div className="space-y-2">
                <StatsBarChart data={partitionData} totalJournals={totalJournals} />
            </div>
            <div className="space-y-2">
                <StatsBarChart data={authorityData} totalJournals={totalJournals} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
