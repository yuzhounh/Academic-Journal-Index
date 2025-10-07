'use server';

import type { Journal } from '@/data/journals';
import {
  summarizeJournalInfo,
  type SummarizeJournalInfoOutput,
} from '@/ai/flows/summarize-journal-info';

export type JournalSummaryInfo = SummarizeJournalInfoOutput;

export async function getSummary(
  journal: Journal
): Promise<JournalSummaryInfo> {
  const minorCategory1 = journal.minorCategories[0];
  const minorCategory2 = journal.minorCategories[1];
  const minorCategory3 = journal.minorCategories[2];
  const minorCategory4 = journal.minorCategories[3];
  const minorCategory5 = journal.minorCategories[4];
  const minorCategory6 = journal.minorCategories[5];
  const summary = await summarizeJournalInfo({
    journalName: journal.journalName,
    year: journal.year.toString(),
    issn: journal.issn,
    review: journal.review,
    oaj: journal.oaj,
    openAccess: journal.openAccess,
    webOfScience: journal.webOfScience,
    impactFactor: journal.impactFactor.toString(),
    annotation: journal.annotation,
    majorCategory: journal.majorCategory,
    majorCategoryPartition: journal.majorCategoryPartition,
    top: journal.top,
    authorityJournal: journal.authorityJournal,
    minorCategory1: minorCategory1?.name ?? '',
    minorCategory1Partition: minorCategory1?.partition ?? '',
    minorCategory2: minorCategory2?.name ?? '',
    minorCategory2Partition: minorCategory2?.partition ?? '',
    minorCategory3: minorCategory3?.name ?? '',
    minorCategory3Partition: minorCategory3?.partition ?? '',
    minorCategory4: minorCategory4?.name ?? '',
    minorCategory4Partition: minorCategory4?.partition ?? '',
    minorCategory5: minorCategory5?.name ?? '',
    minorCategory5Partition: minorCategory5?.partition ?? '',
    minorCategory6: minorCategory6?.name ?? '',
    minorCategory6Partition: minorCategory6?.partition ?? '',
  });

  return summary;
}
