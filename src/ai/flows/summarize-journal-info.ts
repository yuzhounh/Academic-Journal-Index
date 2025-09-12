'use server';

/**
 * @fileOverview Summarizes journal information, highlighting key metrics like impact factor and category rankings.
 *
 * - summarizeJournalInfo - A function that summarizes journal information.
 * - SummarizeJournalInfoInput - The input type for the summarizeJournalInfo function.
 * - SummarizeJournalInfoOutput - The return type for the summarizeJournalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeJournalInfoInputSchema = z.object({
  journalName: z.string().describe('The name of the journal.'),
  year: z.string().describe('The publication year of the journal.'),
  issn: z.string().describe('The ISSN/EISSN of the journal.'),
  review: z.string().describe('Whether the journal is peer-reviewed.'),
  oaj: z.string().describe('Whether the journal is indexed in OAJ.'),
  openAccess: z.string().describe('Whether the journal is open access.'),
  webOfScience: z.string().describe('Whether the journal is in Web of Science.'),
  impactFactor: z.string().describe('The impact factor of the journal.'),
  annotation: z.string().describe('Additional annotations for the journal.'),
  majorCategory: z.string().describe('The major category of the journal.'),
  majorCategoryPartition: z
    .string()
    .describe('The partition of the major category.'),
  top: z.string().describe('Whether the journal is a top journal.'),
  authorityJournal: z.string().describe('The authority level of the journal.'),
  minorCategory1: z.string().describe('The first minor category of the journal.'),
  minorCategory1Partition: z
    .string()
    .describe('The partition of the first minor category.'),
  minorCategory2: z.string().describe('The second minor category of the journal.'),
  minorCategory2Partition: z
    .string()
    .describe('The partition of the second minor category.'),
  minorCategory3: z.string().describe('The third minor category of the journal.'),
  minorCategory3Partition: z
    .string()
    .describe('The partition of the third minor category.'),
  minorCategory4: z.string().describe('The fourth minor category of the journal.'),
  minorCategory4Partition: z
    .string()
    .describe('The partition of the fourth minor category.'),
  minorCategory5: z.string().describe('The fifth minor category of the journal.'),
  minorCategory5Partition: z
    .string()
    .describe('The partition of the fifth minor category.'),
  minorCategory6: z.string().describe('The sixth minor category of the journal.'),
  minorCategory6Partition: z
    .string()
    .describe('The partition of the sixth minor category.'),
});
export type SummarizeJournalInfoInput = z.infer<
  typeof SummarizeJournalInfoInputSchema
>;

const SummarizeJournalInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the journal information.'),
});
export type SummarizeJournalInfoOutput = z.infer<
  typeof SummarizeJournalInfoOutputSchema
>;

export async function summarizeJournalInfo(
  input: SummarizeJournalInfoInput
): Promise<SummarizeJournalInfoOutput> {
  return summarizeJournalInfoFlow(input);
}

const summarizeJournalInfoPrompt = ai.definePrompt({
  name: 'summarizeJournalInfoPrompt',
  input: {schema: SummarizeJournalInfoInputSchema},
  output: {schema: SummarizeJournalInfoOutputSchema},
  prompt: `You are an expert at summarizing journal information.

  Based on the provided journal information, create a concise summary highlighting key metrics such as impact factor, category rankings, and authority level. Focus on the journal's significance and importance in its field.

  Journal Name: {{{journalName}}}
  Year: {{{year}}}
  ISSN/EISSN: {{{issn}}}
  Review: {{{review}}}
  OA Journal Index (OAJ): {{{oaj}}}
  Open Access: {{{openAccess}}}
  Web of Science: {{{webOfScience}}}
  Impact Factor: {{{impactFactor}}}
  Annotation: {{{annotation}}}
  Major Category: {{{majorCategory}}}
  Major Category Partition: {{{majorCategoryPartition}}}
  Top: {{{top}}}
  Authority Journal: {{{authorityJournal}}}
  Minor Category 1: {{{minorCategory1}}}
  Minor Category 1 Partition: {{{minorCategory1Partition}}}
  Minor Category 2: {{{minorCategory2}}}
  Minor Category 2 Partition: {{{minorCategory2Partition}}}
  Minor Category 3: {{{minorCategory3}}}
  Minor Category 3 Partition: {{{minorCategory3Partition}}}
  Minor Category 4: {{{minorCategory4}}}
  Minor Category 4 Partition: {{{minorCategory4Partition}}}
  Minor Category 5: {{{minorCategory5}}}
  Minor Category 5 Partition: {{{minorCategory5Partition}}}
  Minor Category 6: {{{minorCategory6}}}
  Minor Category 6 Partition: {{{minorCategory6Partition}}}
  `,
});

const summarizeJournalInfoFlow = ai.defineFlow(
  {
    name: 'summarizeJournalInfoFlow',
    inputSchema: SummarizeJournalInfoInputSchema,
    outputSchema: SummarizeJournalInfoOutputSchema,
  },
  async input => {
    const {output} = await summarizeJournalInfoPrompt(input);
    return output!;
  }
);
