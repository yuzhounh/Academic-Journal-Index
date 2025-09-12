
"use client";

import { type Journal } from "@/data/journals";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Authority Level</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="Authority level rules">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs md:max-w-sm" side="top" align="center">
                  <div className="p-2 space-y-3">
                    <h3 className="font-bold text-base text-center">权威期刊分级规则</h3>
                    
                    <div>
                      <h4 className="font-semibold text-primary">一级权威期刊</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                        <li>中科院JCR大类分区一区期刊</li>
                        <li>中科院JCR大类分区二区前50%（含50%）期刊</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary/80">二级权威期刊</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                        <li>中科院JCR大类分区二区后50%期刊</li>
                        <li>中科院JCR大类分区三区期刊</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-primary/60">三级权威期刊</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                        <li>中科院JCR大类分区四区期刊</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
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
