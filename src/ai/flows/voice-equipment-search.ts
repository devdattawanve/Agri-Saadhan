'use server';
/**
 * @fileOverview This file implements a Genkit flow for interpreting a farmer's voice query
 * about farm equipment and transforming it into a structured search query.
 *
 * - voiceEquipmentSearch - A function that processes the voice query.
 * - VoiceEquipmentSearchInput - The input type for the voiceEquipmentSearch function.
 * - VoiceEquipmentSearchOutput - The return type for the voiceEquipmentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceEquipmentSearchInputSchema = z.object({
  voiceQuery: z
    .string()
    .describe(
      'The transcribed voice input from the user, e.g., "Rotavator chahiye" or "Tractor kiraaye par chahiye".'
    ),
});
export type VoiceEquipmentSearchInput = z.infer<typeof VoiceEquipmentSearchInputSchema>;

const VoiceEquipmentSearchOutputSchema = z.object({
  equipmentType: z
    .string()
    .describe(
      'The identified type of farm equipment, e.g., "Rotavator", "Tractor", "Plow". If no specific equipment type is identified, return "General Farm Equipment".'
    ),
  rentalIntent: z
    .boolean()
    .describe('True if the user intends to rent the equipment, false otherwise.'),
  keywords: z
    .array(z.string())
    .describe(
      'A list of additional keywords extracted from the query that might help refine the search.'
    ),
});
export type VoiceEquipmentSearchOutput = z.infer<typeof VoiceEquipmentSearchOutputSchema>;

export async function voiceEquipmentSearch(
  input: VoiceEquipmentSearchInput
): Promise<VoiceEquipmentSearchOutput> {
  return voiceEquipmentSearchFlow(input);
}

const voiceEquipmentSearchPrompt = ai.definePrompt({
  name: 'voiceEquipmentSearchPrompt',
  input: {schema: VoiceEquipmentSearchInputSchema},
  output: {schema: VoiceEquipmentSearchOutputSchema},
  prompt: `You are an AI assistant designed to interpret a farmer's voice query for farm equipment and extract key information.
Your goal is to identify the type of equipment being requested, determine if there's an intent to rent, and extract any other relevant keywords.

Consider the following rules:
- If the query contains phrases like "chahiye" (need), "kiraaye par" (for rent), or similar, assume the user has a rental intent, and set \\\`rentalIntent\\\` to true.
- Extract the specific equipment type requested. If no specific equipment type is mentioned but there are keywords related to general farm work, categorize it as "General Farm Equipment".
- Collect any other descriptive words that might help in a search as \\\`keywords\\\`.

Voice Query: "{{{voiceQuery}}}"
`,
});

const voiceEquipmentSearchFlow = ai.defineFlow(
  {
    name: 'voiceEquipmentSearchFlow',
    inputSchema: VoiceEquipmentSearchInputSchema,
    outputSchema: VoiceEquipmentSearchOutputSchema,
  },
  async input => {
    const {output} = await voiceEquipmentSearchPrompt(input);
    return output!;
  }
);
