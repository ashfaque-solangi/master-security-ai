'use server';

import {
  suggestRelevantRemarks,
  type TestResultsInput,
} from '@/ai/flows/suggest-relevant-remarks';

export async function getAIRemarks(input: TestResultsInput): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const result = await suggestRelevantRemarks(input);
    return { success: true, data: result.remarks };
  } catch (error) {
    console.error('AI remarks generation failed:', error);
    return {
      success: false,
      error: 'Failed to generate AI remarks. Please try again.',
    };
  }
}
