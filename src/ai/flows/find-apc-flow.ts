
'use server';

/**
 * @fileOverview A flow for finding the Article Processing Charge (APC) for a journal.
 *
 * - findApc - A function that returns the APC for a given journal.
 * - FindApcInput - The input type for the findApc function.
 * - FindApcOutput - The return type for the findApc function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const FindApcInputSchema = z.object({
  journalName: z.string().describe('The name of the journal to find the APC for.'),
});
export type FindApcInput = z.infer<typeof FindApcInputSchema>;

const FindApcOutputSchema = z.object({
  apc: z.string().describe('The Article Processing Charge for a "Regular Paper" or "Research Article". E.g., "$2500" or "Not found".'),
  apcUrl: z.string().describe("A URL to search for the journal's APC. E.g., a Google search URL."),
});
export type FindApcOutput = z.infer<typeof FindApcOutputSchema>;

const findApcPrompt = ai.definePrompt({
    name: 'findApcPrompt',
    input: { schema: FindApcInputSchema },
    output: { schema: FindApcOutputSchema },
    model: googleAI('gemini-2.5-flash'),
    prompt: `
      You are an expert academic research assistant.
      Your task is to find the Article Processing Charge (APC) for a "Regular Paper" or "Research Article" in a specific journal.
      
      Journal Name: {{{journalName}}}

      1.  Based on your knowledge, find the most recent APC for a "Regular Paper" or "Research Article" for the journal specified.
      2.  The APC should be in USD. For example, "$3000".
      3.  If you cannot find the APC with high confidence, set the "apc" field to "Not found".
      4.  Always provide a Google search URL for the user to verify the information in the "apcUrl" field. The search query should be " {{{journalName}}} article processing charge ".
    `,
});


export async function findApc(input: FindApcInput): Promise<FindApcOutput> {
    return findApcFlow(input);
}

const findApcFlow = ai.defineFlow(
  {
    name: 'findApcFlow',
    inputSchema: FindApcInputSchema,
    outputSchema: FindApcOutputSchema,
  },
  async (input) => {
    const { output } = await findApcPrompt(input);
    return output!;
  }
);
