"use client";

import { type Journal } from "@/data/journals";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award } from "lucide-react";

interface CasPartitionDisplayProps {
  journal: Journal;
}

const partitionMap: { [key: string]: string } = {
  "1": "一区",
  "2": "二区",
  "3": "三区",
  "4": "四区",
};

const PartitionBadge = ({ partition }: { partition: string }) => {
    const match = partition.match(/(\d+)\s*\[(\d+\/\d+)\]/);
    if (!match) return <Badge variant="secondary">{partition}</Badge>;
  
    const [, main, details] = match;
    const chinesePartition = partitionMap[main] || main;
  
    return (
      <div className="flex items-center gap-2">
        <Badge 
            variant={main === '1' ? 'default' : 'secondary'} 
            className={main === '1' ? 'bg-primary text-primary-foreground' : ''}
        >
            {chinesePartition}
        </Badge>
        <span className="text-xs text-muted-foreground">{details}</span>
      </div>
    );
};


export default function CasPartitionDisplay({ journal }: CasPartitionDisplayProps) {
  return (
    <div className="space-y-4">
       <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Authority Level</h4>
        <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            <p className="text-lg font-semibold">{journal.authorityJournal}</p>
        </div>
      </div>
      <Separator/>
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Major Category</h4>
        <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-semibold">{journal.majorCategory}</p>
                {journal.top === "是" && <Badge variant="default" className="bg-amber-500 text-white">Top</Badge>}
            </div>
            <div className="mt-1">
                <PartitionBadge partition={journal.majorCategoryPartition} />
            </div>
        </div>
      </div>
      
      {journal.minorCategories.length > 0 && (
        <div>
            <Separator className="my-4"/>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Minor Categories</h4>
            <div className="space-y-3">
            {journal.minorCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                    <p className="font-medium flex-1 truncate pr-2">{category.name}</p>
                    <PartitionBadge partition={category.partition} />
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
