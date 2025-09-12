"use client";
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
                        const parsedJournals = (results.data as any[]).map((row: any) => {
                            const minorCategories: { name: string; partition: string }[] = [];
                            if (row['小类1'] && row['小类1分区']) {
                                minorCategories.push({ name: row['小类1'], partition: row['小类1分区'] });
                            }
                            if (row['小类2'] && row['小类2分区']) {
                                minorCategories.push({ name: row['小类2'], partition: row['小类2分区'] });
                            }
                            if (row['小类3'] && row['小类3分区']) {
                                minorCategories.push({ name: row['小类3'], partition: row['小类3分区'] });
                            }
                            if (row['小类4'] && row['小类4分区']) {
                                minorCategories.push({ name: row['小类4'], partition: row['小类4分区'] });
                            }
                             if (row['小类5'] && row['小类5分区']) {
                                minorCategories.push({ name: row['小类5'], partition: row['小类5分区'] });
                            }
                             if (row['小类6'] && row['小类6分区']) {
                                minorCategories.push({ name: row['小类6'], partition: row['小类6分区'] });
                            }

                            return {
                                journalName: row['Journal'] || '',
                                year: parseInt(row['年份'], 10) || 0,
                                issn: row['ISSN/EISSN'] || '',
                                review: row['Review'] || '否',
                                oaj: row['OA Journal Index（OAJ）'] || '否',
                                openAccess: row['Open Access'] || '否',
                                webOfScience: row['Web of Science'] || '',
                                impactFactor: parseFloat(row['影响因子']) || row['影响因子'] || 0,
                                annotation: row['标注'] || '',
                                majorCategory: row['大类'] || '',
                                majorCategoryPartition: row['大类分区'] || '',
                                top: row['Top'] || '否',
                                authorityJournal: row['权威期刊'] || '',
                                minorCategories,
                            };
                        }).filter(j => j.journalName);

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
