"use server";

import {
  summarizeJournalInfo,
  type SummarizeJournalInfoInput,
  type SummarizeJournalInfoOutput,
} from "@/ai/flows/summarize-journal-info";
import type { Journal } from "@/data/journals";

export async function getSummary(journal: Journal): Promise<SummarizeJournalInfoOutput> {
  try {
    const input: SummarizeJournalInfoInput = {
      journalName: journal.journalName,
      year: String(journal.year),
      issn: journal.issn,
      review: journal.review,
      oaj: journal.oaj,
      openAccess: journal.openAccess,
      webOfScience: journal.webOfScience,
      impactFactor: String(journal.impactFactor),
      annotation: journal.annotation,
      majorCategory: journal.majorCategory,
      majorCategoryPartition: journal.majorCategoryPartition,
      top: journal.top,
      authorityJournal: journal.authorityJournal,
      minorCategory1: "",
      minorCategory1Partition: "",
      minorCategory2: "",
      minorCategory2Partition: "",
      minorCategory3: "",
      minorCategory3Partition: "",
      minorCategory4: "",
      minorCategory4Partition: "",
      minorCategory5: "",
      minorCategory5Partition: "",
      minorCategory6: "",
      minorCategory6Partition: "",
    };

    journal.minorCategories.forEach((category, index) => {
        if (index < 6) {
            const num = index + 1;
            (input as any)[`minorCategory${num}`] = category.name;
            (input as any)[`minorCategory${num}Partition`] = category.partition;
        }
    });

    const result = await summarizeJournalInfo(input);
    return result;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    // Return a user-friendly error message
    return {
        summary: "An error occurred while generating the summary. The AI service may be temporarily unavailable.",
        relatedJournals: []
    };
  }
}
