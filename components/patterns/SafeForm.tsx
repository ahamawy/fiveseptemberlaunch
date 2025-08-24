import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Props<T extends z.ZodTypeAny> = {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  submitLabel?: string;
};

export function SafeForm<T extends z.ZodTypeAny>({ schema, defaultValues, onSubmit, submitLabel='Save' }: Props<T>) {
  // Use untyped form when external typings are not available at build time
  const { register, handleSubmit, formState: { errors, isSubmitting } } = (useForm as any)({ resolver: zodResolver(schema as any), defaultValues: defaultValues as any });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Usage example: children would map fields via register('field') */}
      {/* For skeleton purposes, we render JSON input if no children supplied */}
      <textarea {...register('json' as any)} className="w-full h-24 bg-white/5 border border-white/10 rounded-md p-2 text-white/90" placeholder="Provide JSON or wire up fields" />
      {Object.keys(errors).length > 0 && <p className="text-red-300 text-sm">Please fix validation errors.</p>}
      <button disabled={isSubmitting} className="bg-equitie-purple text-white px-3 py-2 rounded-md">{isSubmitting ? 'Saving…' : submitLabel}</button>
    </form>
  );
}
