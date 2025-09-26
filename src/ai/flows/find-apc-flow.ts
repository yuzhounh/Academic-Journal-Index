'use server';

/**
 * @fileOverview A flow for finding the Article Processing Charge (APC) for a journal.
 *
 * - findApc - A function that returns the APC for a given journal.
 * - FindApcInput - The input type for the findApc function.
 * - FindApcOutput - The return type for the findApc function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindApcInputSchema = z.object({
  journalName: z.string().describe('The name of the journal to find the APC for.'),
});
export type FindApcInput = z.infer<typeof FindApcInputSchema>;

const FindApcOutputSchema = z.object({
  apc: z.string().describe('The Article Processing Charge for a Regular Paper. E.g., "$2500" or "Not found".'),
  apcUrl: z.string().describe("A URL to search for the journal's APC. E.g., a Google search URL."),
});
export type FindApcOutput = z.infer<typeof FindApcOutputSchema>;


const findApcTool = ai.defineTool(
    {
      name: 'findApcTool',
      description: 'Gets the Article Processing Charge (APC) for a "Regular Paper" or "Research Article" in a given journal and a URL to find it.',
      inputSchema: FindApcInputSchema,
      outputSchema: FindApcOutputSchema,
    },
    async (input) => {
        // In a real application, you would query a database or external API, or use a web-scraping tool.
        // For this demo, we'll simulate it with a random but realistic value and provide a helpful search link.
        
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${input.journalName} article processing charge`)}`;

        const shouldFind = Math.random() > 0.1; // 90% chance of finding a value
        if (shouldFind) {
            const randomApc = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
            return { 
                apc: `$${Math.round(randomApc / 100) * 100}`,
                apcUrl: googleSearchUrl,
            };
        }
        return { 
            apc: "Not found",
            apcUrl: googleSearchUrl
        };
    }
);


const findApcPrompt = ai.definePrompt({
    name: 'findApcPrompt',
    input: { schema: FindApcInputSchema },
    output: { schema: FindApcOutputSchema },
    tools: [findApcTool],
    prompt: `Use the findApcTool to find the article processing charge for a Regular Paper in the journal: {{{journalName}}}.`,
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
