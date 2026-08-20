import React from 'react';
import { getFormById, getAllForms } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FormStudio } from '@/components/studio/FormStudio';

export const dynamic = 'force-dynamic';

interface FormPageProps {
  params: {
    id: string;
  };
}

export default async function FormDetailPage({ params }: FormPageProps) {
  const [form, allForms] = await Promise.all([
    getFormById(params.id),
    getAllForms(),
  ]);

  if (!form) {
    notFound();
  }

  return <FormStudio initialForm={form} allForms={allForms} />;
}
