'use server';

import { useJsonStore } from '@/lib/store';
import { suggestRelevantRemarks, TestResultsInput } from '@/ai/flows/suggest-relevant-remarks';

/**
 * @fileOverview Global Server Actions for SecureGuard Command.
 * Legacy medical AI remarks have been removed in favor of security-focused operations.
 */

export async function placeholderAction() {
  return { success: true };
}

/**
 * AI Remarks Action (Legacy/Build Stability)
 */
export async function getAIRemarks(input: TestResultsInput) {
  try {
    const result = await suggestRelevantRemarks(input);
    return { success: true, data: result.remarks };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate AI remarks' };
  }
}
