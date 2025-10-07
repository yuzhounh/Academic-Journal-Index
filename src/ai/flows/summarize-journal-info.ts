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
  summary: z.string().describe('A comprehensive summary of the journal covering its introduction, main publication areas, and status within its field.'),
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
  prompt: `你是一位专业的学术期刊分析师。

  请根据下面提供的期刊信息，用中文生成一段详细的分析报告。报告应包含以下几个部分：
  1. **期刊简介**: 简要介绍该期刊的背景、历史和出版商。
  2. **主要发表领域**: 详细说明该期刊主要覆盖的研究方向和学科领域。
  3. **在领域内的地位**: 结合影响因子、中科院分区、权威等级等指标，分析该期刊在其学术领域中的影响力和地位。
  
  最后，请使用 findJournalsTool 工具，根据当前期刊的主要学科 (Major Category: {{{majorCategory}}})，查找并列出 3-5 种相关的期刊作为推荐。

  期刊信息如下:
  - 期刊名称: {{{journalName}}}
  - 年份: {{{year}}}
  - ISSN/EISSN: {{{issn}}}
  - 同行评审: {{{review}}}
  - 开放获取: {{{openAccess}}}
  - Web of Science收录: {{{webOfScience}}}
  - 影响因子: {{{impactFactor}}}
  - 标注: {{{annotation}}}
  - 主要学科: {{{majorCategory}}}
  - 主要学科分区: {{{majorCategoryPartition}}}
  - Top期刊: {{{top}}}
  - 权威期刊: {{{authorityJournal}}}
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
