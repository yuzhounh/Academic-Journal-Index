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
  relatedJournals: z.array(z.object({
    journalName: z.string().describe("The name of the related journal."),
    issn: z.string().describe("The ISSN of the related journal."),
  })).describe("A list of journals related to the current one.")
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
  model: 'googleai/gemini-2.5-flash',
  prompt: `你是一位专业的期刊信息总结专家。

  请根据下面提供的期刊信息，用中文生成一段简明扼要的总结。总结应突出期刊的关键指标，如影响因子、学科分区排名和权威等级，并说明该期刊在其研究领域的重要性和地位。
  
  在总结下方，请使用 findJournalsTool 工具根据当前期刊的主要学科或次要学科，查找并列出 3-5 种相关的期刊。

  期刊名称: {{{journalName}}}
  年份: {{{year}}}
  ISSN/EISSN: {{{issn}}}
  同行评审: {{{review}}}
  OAJ收录: {{{oaj}}}
  开放获取: {{{openAccess}}}
  Web of Science收录: {{{webOfScience}}}
  影响因子: {{{impactFactor}}}
  标注: {{{annotation}}}
  主要学科: {{{majorCategory}}}
  主要学科分区: {{{majorCategoryPartition}}}
  Top期刊: {{{top}}}
  权威期刊: {{{authorityJournal}}}
  次要学科1: {{{minorCategory1}}}
  次要学科1分区: {{{minorCategory1Partition}}}
  次要学科2: {{{minorCategory2}}}
  次要学科2分区: {{{minorCategory2Partition}}}
  次要学科3: {{{minorCategory3}}}
  次要学科3分区: {{{minorCategory3Partition}}}
  次要学科4: {{{minorCategory4}}}
  次要学科4分区: {{{minorCategory4Partition}}}
  次要学科5: {{{minorCategory5}}}
  次要学科5分区: {{{minorCategory5Partition}}}
  次要学科6: {{{minorCategory6}}}
  次要学科6分区: {{{minorCategory6Partition}}}
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
