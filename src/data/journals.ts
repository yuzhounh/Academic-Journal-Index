
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

function parseJournals(results: Papa.ParseResult<any>): Journal[] {
  const data = results.data;
  if (!data || data.length === 0) return [];

  // Check if headers were parsed correctly into objects
  if (typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
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
        journalName: row['journal name'] || '',
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

  // Fallback: If data is an array of arrays, manually map it
  const headers = data[0].map((h: string) => h.trim());
  const rows = data.slice(1);
  const getIndex = (name: string) => headers.indexOf(name);
  
  const colIndices = {
    journalName: getIndex('journal name'),
    year: getIndex('Year'),
    issn: getIndex('ISSN/EISSN'),
    review: getIndex('Review'),
    oaj: getIndex('OAJ'),
    openAccess: getIndex('Open Access'),
    webOfScience: getIndex('Web of Science'),
    impactFactor: getIndex('Impact Factor'),
    annotation: getIndex('Annotation'),
    majorCategory: getIndex('大类'),
    majorCategoryPartition: getIndex('大类分区'),
    top: getIndex('Top'),
    authorityJournal: getIndex('权威期刊'),
    minorCat1Name: getIndex('小类1名称'),
    minorCat1Partition: getIndex('小类1分区'),
    minorCat2Name: getIndex('小类2名称'),
    minorCat2Partition: getIndex('小类2分区'),
    minorCat3Name: getIndex('小类3名称'),
    minorCat3Partition: getIndex('小类3分区'),
    minorCat4Name: getIndex('小类4名称'),
    minorCat4Partition: getIndex('小类4分区'),
    minorCat5Name: getIndex('小类5名称'),
    minorCat5Partition: getIndex('小类5分区'),
    minorCat6Name: getIndex('小类6名称'),
    minorCat6Partition: getIndex('小类6分区'),
  };
  
  return rows.map((row: any[]) => {
    const minorCategories: { name: string; partition: string }[] = [];
    if (row[colIndices.minorCat1Name] && row[colIndices.minorCat1Partition]) {
      minorCategories.push({ name: row[colIndices.minorCat1Name], partition: row[colIndices.minorCat1Partition] });
    }
    if (row[colIndices.minorCat2Name] && row[colIndices.minorCat2Partition]) {
        minorCategories.push({ name: row[colIndices.minorCat2Name], partition: row[colIndices.minorCat2Partition] });
    }
    if (row[colIndices.minorCat3Name] && row[colIndices.minorCat3Partition]) {
        minorCategories.push({ name: row[colIndices.minorCat3Name], partition: row[colIndices.minorCat3Partition] });
    }
    if (row[colIndices.minorCat4Name] && row[colIndices.minorCat4Partition]) {
        minorCategories.push({ name: row[colIndices.minorCat4Name], partition: row[colIndices.minorCat4Partition] });
    }
    if (row[colIndices.minorCat5Name] && row[colIndices.minorCat5Partition]) {
        minorCategories.push({ name: row[colIndices.minorCat5Name], partition: row[colIndices.minorCat5Partition] });
    }
    if (row[colIndices.minorCat6Name] && row[colIndices.minorCat6Partition]) {
        minorCategories.push({ name: row[colIndices.minorCat6Name], partition: row[colIndices.minorCat6Partition] });
    }

    return {
      journalName: row[colIndices.journalName] || '',
      year: parseInt(row[colIndices.year], 10) || 0,
      issn: row[colIndices.issn] || '',
      review: row[colIndices.review] || '否',
      oaj: row[colIndices.oaj] || '否',
      openAccess: row[colIndices.openAccess] || '否',
      webOfScience: row[colIndices.webOfScience] || '',
      impactFactor: parseFloat(row[colIndices.impactFactor]) || row[colIndices.impactFactor] || 0,
      annotation: row[colIndices.annotation] || '',
      majorCategory: row[colIndices.majorCategory] || '',
      majorCategoryPartition: row[colIndices.majorCategoryPartition] || '',
      top: row[colIndices.top] || '否',
      authorityJournal: row[colIndices.authorityJournal] || '',
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
                        const parsedJournals = parseJournals(results);
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
