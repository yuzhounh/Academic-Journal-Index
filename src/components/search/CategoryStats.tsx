
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
import { useTranslation } from "@/i18n/provider";


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
  "Q1": "#ef4444",
  "Q2": "#f97316",
  "Q3": "#eab308",
  "Q4": "#22c55e",
};

const authorityColors: { [key: string]: string } = {
  "一级": "#f75c2e",
  "二级": "#f79410",
  "三级": "#22c55e",
  "Level 1": "#f75c2e",
  "Level 2": "#f79410",
  "Level 3": "#22c55e",
};

const openAccessColors: { [key: string]: string } = {
    "Closed Access": "#f97316",
    "Open Access": "#34d399",
};

const StatsBarChart = ({ data, totalJournals }: { data: { name: string; count: number, fill: string }[]; totalJournals: number }) => {
    const { t } = useTranslation();
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
                                <p>{t('stats.count')}: {item.count}</p>
                                <p>{t('stats.ratio')}: {((item.count / totalJournals) * 100).toFixed(1)}%</p>
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
  const { t, locale } = useTranslation();
  const totalJournals = journals.length;

  const partitionData = useMemo(() => {
    const partitionKeys = locale === 'zh' ? ['一区', '二区', '三区', '四区'] : ['Q1', 'Q2', 'Q3', 'Q4'];
    const counts: { [key: string]: number } = { [partitionKeys[0]]: 0, [partitionKeys[1]]: 0, [partitionKeys[2]]: 0, [partitionKeys[3]]: 0 };
    journals.forEach((j) => {
      const p = j.majorCategoryPartition.charAt(0);
      if (p === '1') counts[partitionKeys[0]]++;
      else if (p === '2') counts[partitionKeys[1]]++;
      else if (p === '3') counts[partitionKeys[2]]++;
      else if (p === '4') counts[partitionKeys[3]]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: partitionColors[name] })).filter(item => item.count > 0);
  }, [journals, locale]);

  const authorityData = useMemo(() => {
    const authorityKeys = locale === 'zh' ? ['一级', '二级', '三级'] : ['Level 1', 'Level 2', 'Level 3'];
    const counts: { [key: string]: number } = { [authorityKeys[0]]: 0, [authorityKeys[1]]: 0, [authorityKeys[2]]: 0 };
    journals.forEach((j) => {
      if (j.authorityJournal === "一级") counts[authorityKeys[0]]++;
      else if (j.authorityJournal === "二级") counts[authorityKeys[1]]++;
      else if (j.authorityJournal === "三级") counts[authorityKeys[2]]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: authorityColors[name] })).filter(item => item.count > 0);
  }, [journals, locale]);

  const openAccessData = useMemo(() => {
    const keys = { "Open Access": t('stats.oa.open'), "Closed Access": t('stats.oa.closed') };
    const counts = { [keys["Closed Access"]]: 0, [keys["Open Access"]]: 0 };
    journals.forEach((j) => {
      if (j.openAccess === "是") {
        counts[keys["Open Access"]]++;
      } else {
        counts[keys["Closed Access"]]++;
      }
    });
    return Object.entries(counts)
      .sort(([a], [b]) => (a === keys["Closed Access"] ? -1 : 1))
      .map(([name, count]) => ({ name, count, fill: name === keys['Open Access'] ? openAccessColors['Open Access'] : openAccessColors['Closed Access'] }))
      .filter(item => item.count > 0);
  }, [journals, t]);

  const allStats = [
    { title: t('stats.partitionTitle'), data: partitionData },
    { title: t('stats.authorityTitle'), data: authorityData },
    { title: t('stats.oaTitle'), data: openAccessData },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">{t('stats.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <p className="text-base text-muted-foreground">{t('stats.totalJournals')}</p>
            <p className="text-4xl font-bold">{totalJournals}</p>
        </div>

        {/* Mobile Layout: Vertical stacking */}
        <div className="grid grid-cols-1 gap-y-6 md:hidden">
          {allStats.map(stat => (
            <div key={stat.title}>
              <StatsDetails title={stat.title} data={stat.data} total={totalJournals} />
              <div className="mt-4 space-y-2">
                <StatsBarChart data={stat.data} totalJournals={totalJournals} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Layout: Grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-6">
            <StatsDetails title={t('stats.partitionTitle')} data={partitionData} total={totalJournals} />
            <StatsDetails title={t('stats.authorityTitle')} data={authorityData} total={totalJournals} />
            <StatsDetails title={t('stats.oaTitle')} data={openAccessData} total={totalJournals} />

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
