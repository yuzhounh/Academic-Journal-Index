
"use client"
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export type Journal = {
  journalName: string;
  year: number;
  issn: string;
  review: string;
  oaj: string;
  openAccess: string;
  webOfScience: string;
  impactFactor: number | string;
  annotation: string;
  majorCategory: string;
  majorCategoryPartition: string;
  top: string;
  authorityJournal: string;
  minorCategories: { name: string; partition: string }[];
};

function parseJournals(data: any[]): Journal[] {
  return data.map((row: any) => {
    const minorCategories: { name: string; partition: string }[] = [];
    if (row['小类1名称'] && row['小类1分区']) {
      minorCategories.push({ name: row['小类1名称'], partition: row['小类1分区'] });
    }
    if (row['小类2名称'] && row['小类2分区']) {
        minorCategories.push({ name: row['小类2名称'], partition: row['小类2分区'] });
    }
    if (row['小类3名称'] && row['小类3分区']) {
        minorCategories.push({ name: row['小类3名称'], partition: row['小类3分区'] });
    }
    if (row['小类4名称'] && row['小类4分区']) {
        minorCategories.push({ name: row['小类4名称'], partition: row['小类4分区'] });
    }
    if (row['小类5名称'] && row['小类5分区']) {
        minorCategories.push({ name: row['小类5名称'], partition: row['小类5分区'] });
    }
    if (row['小类6名称'] && row['小类6分区']) {
        minorCategories.push({ name: row['小类6名称'], partition: row['小类6分区'] });
    }

    return {
      journalName: row['Journal name'] || '',
      year: parseInt(row['Year'], 10) || 0,
      issn: row['ISSN/EISSN'] || '',
      review: row['Review'] || '否',
      oaj: row['OAJ'] || '否',
      openAccess: row['Open Access'] || '否',
      webOfScience: row['Web of Science'] || '',
      impactFactor: parseFloat(row['Impact Factor']) || row['Impact Factor'] || 0,
      annotation: row['Annotation'] || '',
      majorCategory: row['大类'] || '',
      majorCategoryPartition: row['大类分区'] || '',
      top: row['Top'] || '否',
      authorityJournal: row['权威期刊'] || '',
      minorCategories,
    };
  }).filter(j => j.journalName);
}

export function useJournals() {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJournals() {
            try {
                const response = await fetch('/FQBJCR2025-QWQKFJ-UTF8.csv');
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const parsedJournals = parseJournals(results.data);
                        setJournals(parsedJournals);
                        setLoading(false);
                    },
                    error: (error: any) => {
                        console.error('Error parsing CSV file:', error);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching CSV file:', error);
                setLoading(false);
            }
        }
        loadJournals();
    }, []);

    return { journals, loading };
}
