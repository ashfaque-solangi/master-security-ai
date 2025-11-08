'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import type { Sample } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SmartRemarking } from './smart-remarking';
import { Save } from 'lucide-react';

const resultSchema = z.object({
  parameter: z.string(),
  value: z.number().nullable(),
  unit: z.string(),
  referenceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

const formSchema = z.object({
  results: z.array(resultSchema),
});

type ResultEntryFormProps = {
  sample: Sample;
  isVerified: boolean;
};

export function ResultEntryForm({ sample, isVerified }: ResultEntryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      results: sample.results,
    },
    disabled: isVerified,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'results',
  });

  const currentResults = form.watch('results');
  
  const testResultsForAI = currentResults.reduce((acc, result) => {
    if (result.parameter && result.value !== null) {
      acc[result.parameter] = result.value;
    }
    return acc;
  }, {} as Record<string, number>);

  const referenceRangesForAI = currentResults.reduce((acc, result) => {
    if (result.parameter) {
      acc[result.parameter] = result.referenceRange;
    }
    return acc;
  }, {} as Record<string, { min: number; max: number }>);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result Entry</CardTitle>
        <CardDescription>
          Enter the test results for this sample.
          {isVerified && " This form is read-only as results are verified."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map((field, index) => {
                const isAbnormal =
                  field.value !== null &&
                  (field.value < field.referenceRange.min ||
                    field.value > field.referenceRange.max);
                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`results.${index}.value`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.parameter} ({field.unit})</FormLabel>
                        <FormControl>
                          <Input
                            {...formField}
                            type="number"
                            step="any"
                            value={formField.value ?? ''}
                            onChange={(e) => formField.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            className={isAbnormal ? 'border-destructive ring-destructive ring-1' : ''}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Ref: {field.referenceRange.min} - {field.referenceRange.max}
                        </p>
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SmartRemarking
                testName={sample.testName}
                testResults={testResultsForAI}
                referenceRanges={referenceRangesForAI}
                predefinedRules={sample.predefinedRules}
                statisticalData={sample.statisticalData}
                disabled={isVerified}
            />
            <Button type="submit" disabled={isVerified}>
              <Save className="mr-2 h-4 w-4" /> Save Results
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
