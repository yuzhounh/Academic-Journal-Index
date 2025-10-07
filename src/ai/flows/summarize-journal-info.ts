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
  prompt: `你是一位专业的学术期刊分析师。

  请根据你的知识库，为以下期刊生成一份详细的分析报告。

  期刊名称: {{{journalName}}}

  报告应包含以下几个部分，全部用中文撰写。
  请使用纯文本格式，不要使用任何 Markdown 语法（例如 #, *, _ 等）。
  使用换行和简单的缩进（空格）来组织内容，确保可读性。

  报告结构如下:
  1. 期刊简介
     [此处是期刊的背景、历史、出版商等简介]

  2. 主要发表领域
     [此处详细说明期刊覆盖的研究方向和学科领域，可以分点陈述]

  3. 在领域内的地位
     [此处结合期刊的学术声誉、常见指标和影响力，分析其在学术领域中的地位]

  4. 相关期刊推荐
     使用 findJournalsTool 工具，根据当前期刊的核心学科分类，查找并列出 3-5 种相关的期刊作为推荐。
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
