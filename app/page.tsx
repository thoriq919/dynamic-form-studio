import React from 'react';
import { getAllForms } from '@/lib/db';
import { FormStudio } from '@/components/studio/FormStudio';

import { initialFormsData } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const forms = await getAllForms();
  const allForms = forms && forms.length > 0 ? forms : initialFormsData;
  const defaultForm = allForms[0];

  return <FormStudio initialForm={defaultForm} allForms={allForms} />;
}
