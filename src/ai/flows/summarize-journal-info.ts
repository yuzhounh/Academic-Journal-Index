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
import { findJournalsTool } from '../tools/find-journals';

const SummarizeJournalInfoInputSchema = z.object({
  journalName: z.string().describe('The name of the journal.'),
  locale: z.enum(['en', 'zh']).describe('The locale for the output language.'),
});
export type SummarizeJournalInfoInput = z.infer<
  typeof SummarizeJournalInfoInputSchema
>;

const SummarizeJournalInfoOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the journal covering its introduction, main publication areas, and status within its field. The output should be plain text, using newlines for structure. Do not use any Markdown formatting.'),
  relatedJournals: z.array(z.object({
    journalName: z.string().describe("The name of the related journal."),
    issn: z.string().describe("The ISSN of the related journal."),
  })).describe("A list of 3-5 journals related to the current one based on its main category.")
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
  tools: [findJournalsTool],
  prompt: `
    You are a professional academic journal analyst.
    Your task is to generate a detailed analysis report for the following journal.
    The entire report MUST be written in the language of the provided locale: {{{locale}}}.

    Journal Name: {{{journalName}}}

    The report should include the following sections.
    Use plain text format, do not use any Markdown syntax (e.g., #, *, _).
    Use newlines and simple indentation (spaces) to organize the content for readability.

    Report Structure:
    1. Journal Introduction
       [Provide a background, history, and publisher introduction for the journal here]

    2. Main Publication Areas
       [Detail the research directions and subject areas covered by the journal, can be listed as points]

    3. Status in the Field
       [Analyze the journal's position in its academic field, combining its academic reputation, common metrics, and influence]

    Additionally, use the findJournalsTool to find and list 3-5 related journals based on the current journal's core subject category, and populate them into the 'relatedJournals' field.
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
