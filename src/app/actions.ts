'use server';

import type { Journal } from '@/data/journals';
import {
  summarizeJournalInfo,
  type SummarizeJournalInfoOutput,
} from '@/ai/flows/summarize-journal-info';

export type JournalSummaryInfo = SummarizeJournalInfoOutput;

export async function getSummary(
  journalName: string
): Promise<JournalSummaryInfo> {
  const summary = await summarizeJournalInfo({
    journalName: journalName,
  });

  return summary;
}
