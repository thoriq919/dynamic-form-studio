import React from 'react';
import { getAllForms } from '@/lib/db';
import { FormStudio } from '@/components/studio/FormStudio';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage() {
  const forms = await getAllForms();
  const defaultForm = forms && forms.length > 0 ? forms[0] : undefined;

  return <FormStudio initialForm={defaultForm} allForms={forms} />;
}
