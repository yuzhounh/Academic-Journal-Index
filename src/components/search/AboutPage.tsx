
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, Github, Users, BookOpen } from 'lucide-react';

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
        icon: Mail,
        label: 'Email',
        value: 'yuzhounh@163.com',
        href: 'mailto:yuzhounh@163.com'
    },
    {
        icon: Github,
        label: 'GitHub',
        value: 'yuzhounh/Academic-Journal-Index',
        href: 'https://github.com/yuzhounh/Academic-Journal-Index'
    }
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <BookOpen className="text-primary" />
            About Academic Journal Index
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base text-foreground/80 leading-relaxed space-y-4">
          <p>
            This website, Academic Journal Index (AJI), is a tool designed to help researchers and academics quickly find information about academic journals. You can search for journals by title or browse through different categories. 
          </p>
          <p>
            The platform provides key metrics such as Impact Factor, CAS Partition (from the Chinese Academy of Sciences), and authority level, helping users to better evaluate and select journals for their publication needs. You can also create an account to save your favorite journals for easy access.
          </p>
          <p>
            All journal data is based on publicly available information and is intended for reference purposes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <ExternalLink className="text-primary" />
            Related Links
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
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {contacts.map(contact => (
                <div key={contact.label} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24">
                        <contact.icon className="w-5 h-5 text-muted-foreground"/>
                        <span className="font-semibold">{contact.label}</span>
                    </div>
                    <a href={contact.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">
                        {contact.value}
                    </a>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
