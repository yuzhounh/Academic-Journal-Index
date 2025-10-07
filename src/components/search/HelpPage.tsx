
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Github, Search, Book, Heart, Bot, FileQuestion, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/i18n/provider';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-foreground/80">{description}</p>
        </CardContent>
    </Card>
);

export default function HelpPage() {
    const { t } = useTranslation();

    const features = [
        {
            icon: Search,
            titleKey: 'help.search.title',
            descriptionKey: 'help.search.p1',
        },
        {
            icon: Book,
            titleKey: 'help.browse.title',
            descriptionKey: 'help.browse.p1',
        },
        {
            icon: Heart,
            titleKey: 'help.favorites.title',
            descriptionKey: 'help.favorites.p1',
        },
        {
            icon: Bot,
            titleKey: 'help.ai.title',
            descriptionKey: 'help.ai.p1',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
            <Card className="bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                        <LifeBuoy className="text-primary w-8 h-8" />
                        {t('help.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-foreground/80 leading-relaxed">{t('help.p1')}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map(feature => (
                    <FeatureCard 
                        key={feature.titleKey}
                        icon={feature.icon}
                        title={t(feature.titleKey)}
                        description={t(feature.descriptionKey)}
                    />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                        <MessageSquare className="text-primary" />
                        {t('help.feedback.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-base text-foreground/80">{t('help.feedback.p1')}</p>
                    <Button asChild className="gap-2">
                        <a href="https://github.com/yuzhounh/Academic-Journal-Index/issues" target="_blank" rel="noopener noreferrer">
                            <Github className="w-5 h-5" />
                            {t('help.feedback.button')}
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
