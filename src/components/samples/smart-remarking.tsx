'use client';

import { useState, useTransition } from 'react';
import { MessageSquareQuote, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { TestResultsInput } from '@/ai/flows/suggest-relevant-remarks';
import { getAIRemarks } from '@/app/actions';

type SmartRemarkingProps = {
  disabled: boolean;
} & TestResultsInput;

export function SmartRemarking({
  testName,
  testResults,
  referenceRanges,
  predefinedRules,
  statisticalData,
  disabled
}: SmartRemarkingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSuggestRemarks = () => {
    startTransition(async () => {
      if (Object.keys(testResults).length === 0) {
        toast({
            variant: "destructive",
            title: "No Results Entered",
            description: "Please enter some test results before suggesting remarks.",
        });
        return;
      }
      
      const result = await getAIRemarks({
        testName,
        testResults,
        referenceRanges,
        predefinedRules,
        statisticalData,
      });

      if (result.success && result.data) {
        setSuggestions(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <MessageSquareQuote className="mr-2 h-4 w-4" />
          AI Remarks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI-Suggested Remarks</DialogTitle>
          <DialogDescription>
            Review and use these AI-generated remarks based on the test data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Button
            onClick={handleSuggestRemarks}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Suggestions
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2 rounded-md border p-4">
                <h4 className="font-medium">Suggestions:</h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {suggestions.map((remark, index) => (
                  <li key={index}>{remark}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
