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

  请根据你的知识库，为以下期刊生成一份详细的分析报告。

  期刊名称: {{{journalName}}}

  报告应包含以下几个部分，全部用中文撰写：
  1.  **期刊简介**: 简要介绍该期刊的背景、历史、出版商等。
  2.  **主要发表领域**: 详细说明该期刊主要覆盖的研究方向和学科领域。
  3.  **在领域内的地位**: 结合该期刊的学术声誉、常见指标（如影响因子范围、分区情况等）和影响力，分析其在学术领域中的地位。
  4.  **相关期刊推荐**: 使用 findJournalsTool 工具，根据当前期刊的主要学科，查找并列出 3-5 种相关的期刊作为推荐。在调用工具时，请使用你判断出的最核心的学科分类作为查询参数。
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
