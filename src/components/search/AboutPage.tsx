
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Mail, Github, Users, BookOpen, User } from 'lucide-react';
import { useTranslation } from '@/i18n/provider';

const links = [
  {
    title: 'Journal Citation Reports | Clarivate',
    href: 'https://clarivate.com/academia-government/scientific-and-academic-research/research-funding-analytics/journal-citation-reports/',
  },
  {
    title: '中国科学院文献情报中心期刊分区表',
    href: 'https://www.fenqubiao.com/',
  },
  {
    title: '信阳师范学院权威期刊目录',
    href: 'http://kjc.xynu.edu.cn/info/1004/1251.htm',
  },
  {
    title: 'LetPub 最新SCI期刊影响因子查询',
    href: 'https://www.letpub.com.cn/index.php?page=journalapp',
  },
  {
    title: 'hitfyd/ShowJCR: 期刊分区查询小工具',
    href: 'https://github.com/hitfyd/ShowJCR',
  },
];

const contacts = [
    {
        icon: User,
        labelKey: 'author',
        value: 'Jing Wang',
    },
    {
        icon: Mail,
        labelKey: 'email',
        value: 'yuzhounh@163.com',
        href: 'mailto:yuzhounh@163.com'
    },
    {
        icon: Github,
        labelKey: 'github',
        value: 'yuzhounh/Academic-Journal-Index',
        href: 'https://github.com/yuzhounh/Academic-Journal-Index'
    }
]

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <BookOpen className="text-primary" />
            {t('about.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base text-foreground/80 leading-relaxed space-y-4">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <ExternalLink className="text-primary" />
            {t('about.linksTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                        <ExternalLink className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm flex-1">{link.title}</span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Users className="text-primary" />
            {t('about.contactTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {contacts.map(contact => (
                <div key={contact.labelKey} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24">
                        <contact.icon className="w-5 h-5 text-muted-foreground"/>
                        <span className="font-semibold">{t(`about.contact.${contact.labelKey}`)}</span>
                    </div>
                    {contact.href ? (
                        <a href={contact.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">
                            {contact.value}
                        </a>
                    ) : (
                        <span className="font-medium">{contact.value}</span>
                    )}
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
