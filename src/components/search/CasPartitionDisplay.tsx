
"use client";

import { type Journal } from "@/data/journals";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Info, Crown, Medal, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/i18n/provider";
import { getMajorCategoryName, getMinorCategoryName } from "@/i18n/categories";

const getPartitionBadgeVariant = (partition: string): "level1" | "level2" | "level3" | "level4" | "secondary" => {
    const mainPartition = partition.charAt(0);
    switch (mainPartition) {
        case '1': return "level1";
        case '2': return "level2";
        case '3': return "level3";
        case '4': return "level4";
        default: return "secondary";
    }
};

const PartitionBadge = ({ partition }: { partition: string }) => {
    const { t } = useTranslation();
    const match = partition.match(/(\d+)\s*(.*)/);
    if (!match) return <Badge variant="secondary">{partition}</Badge>;
  
    const [, main, details] = match;

    let mainPartitionText;
    switch (main) {
        case '1': mainPartitionText = t('cas.partitions.1'); break;
        case '2': mainPartitionText = t('cas.partitions.2'); break;
        case '3': mainPartitionText = t('cas.partitions.3'); break;
        case '4': mainPartitionText = t('cas.partitions.4'); break;
        default: mainPartitionText = main;
    }
    
    const variant = getPartitionBadgeVariant(main);
  
    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant}>
            {mainPartitionText}
        </Badge>
        {details && <span className="text-xs text-muted-foreground">{details.replace(/[\[\]]/g, '')}</span>}
      </div>
    );
};

const AuthorityLevelDisplay = ({ level }: { level: string }) => {
    let icon;
    let variant: "authority1" | "authority2" | "authority3" | "secondary" = "secondary";
    const { t } = useTranslation();

    let levelText = level;
    if (level === "一级") levelText = t('cas.authority.1');
    if (level === "二级") levelText = t('cas.authority.2');
    if (level === "三级") levelText = t('cas.authority.3');

    switch (level) {
        case "一级":
            icon = <Crown className="h-4 w-4" />;
            variant = "authority1";
            break;
        case "二级":
            icon = <Medal className="h-4 w-4" />;
            variant = "authority2";
            break;
        case "三级":
            icon = <Star className="h-4 w-4" />;
            variant = "authority3";
            break;
        default:
            icon = <Award className="h-4 w-4" />;
    }
    return (
        <Badge variant={variant} className="gap-1.5 pl-1.5 pr-2">
            {icon}
            <p className="font-semibold">{levelText}</p>
        </Badge>
    )
}

interface CasPartitionDisplayProps {
    journal: Journal;
}

export default function CasPartitionDisplay({ journal }: CasPartitionDisplayProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-4">
       <div>
        <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{t('cas.authorityLevel')}</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label={t('cas.tooltip.ariaLabel')}>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs md:max-w-sm" side="top" align="center">
                  <div className="p-2 space-y-3">
                    <h3 className="font-bold text-base text-center">{t('cas.tooltip.title')}</h3>
                    
                    <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-400" />
                        {t('cas.tooltip.level1.title')}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-1">
                        <li>{t('cas.tooltip.level1.rule1')}</li>
                        <li>{t('cas.tooltip.level1.rule2')}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary/80 flex items-center gap-2">
                        <Medal className="h-5 w-5 text-slate-400" />
                        {t('cas.tooltip.level2.title')}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-1">
                        <li>{t('cas.tooltip.level2.rule1')}</li>
                        <li>{t('cas.tooltip.level2.rule2')}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-primary/60 flex items-center gap-2">
                        <Star className="h-5 w-5 text-orange-400" />
                        {t('cas.tooltip.level3.title')}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-1">
                        <li>{t('cas.tooltip.level3.rule1')}</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
        <AuthorityLevelDisplay level={journal.authorityJournal} />
      </div>
      <Separator/>
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">{t('cas.majorCategory')}</h4>
        <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-semibold flex-1 truncate pr-2">{getMajorCategoryName(journal.majorCategory, locale)}</p>
                <div className="flex items-center gap-2">
                    {journal.top === "是" && <Badge variant="default" className="bg-amber-500 text-white">Top</Badge>}
                    <PartitionBadge partition={journal.majorCategoryPartition} />
                </div>
            </div>
        </div>
      </div>
      
      {journal.minorCategories.length > 0 && (
        <div>
            <Separator className="my-4"/>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">{t('cas.minorCategories')}</h4>
            <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
            {journal.minorCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                    <p className="font-medium flex-1 truncate pr-2">{getMinorCategoryName(category.name, locale)}</p>
                    <PartitionBadge partition={category.partition} />
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
