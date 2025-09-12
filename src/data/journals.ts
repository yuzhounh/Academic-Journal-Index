import Papa from 'papaparse';
import path from 'path';
import fs from 'fs';

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

function parseJournals(): Journal[] {
  const csvFilePath = path.resolve('./FQBJCR2025-QWQKFJ-UTF8.csv');
  let fileContent;
  try {
    fileContent = fs.readFileSync(csvFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }

  const { data } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const journals: Journal[] = data.map((row: any) => {
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

  return journals;
}


export const journals: Journal[] = parseJournals();
