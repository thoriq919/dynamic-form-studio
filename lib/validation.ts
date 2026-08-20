import { z } from 'zod';
import { FormField, EvaluatedFieldState } from '@/types/form';
import { flattenFieldTree } from './rules';

export function generateDynamicZodSchema(
  fields: FormField[],
  evaluatedStates: Record<string, EvaluatedFieldState>
) {
  const flatFields = flattenFieldTree(fields);
  const shape: Record<string, z.ZodTypeAny> = {};

  flatFields.forEach(field => {
    const state = evaluatedStates[field.name];
    const isVisible = state ? state.visible : true;
    const isRequired = state ? state.required : field.required;

    if (!isVisible) {
      shape[field.name] = z.any().optional().nullable();
      return;
    }

    if (isRequired) {
      if (field.type === 'select' || field.type === 'option') {
        shape[field.name] = z
          .string({
            required_error: `${field.label} wajib dipilih`,
            invalid_type_error: `${field.label} tidak valid`,
          })
          .min(1, `${field.label} wajib dipilih`);
      } else {
        shape[field.name] = z
          .string({
            required_error: `${field.label} wajib diisi`,
            invalid_type_error: `${field.label} tidak valid`,
          })
          .trim()
          .min(1, `${field.label} wajib diisi`);
      }
    } else {
      shape[field.name] = z.string().optional().nullable().or(z.literal(''));
    }
  });

  return z.object(shape);
}
