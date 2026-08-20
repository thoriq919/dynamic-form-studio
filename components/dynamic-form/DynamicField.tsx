'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormField, EvaluatedFieldState } from '@/types/form';
import { SelectField } from './SelectField';
import { OptionField } from './OptionField';
import { TextField } from './TextField';

interface DynamicFieldProps {
  field: FormField;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  evaluatedStates: Record<string, EvaluatedFieldState>;
  formValues: Record<string, any>;
  depth?: number;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  register,
  errors,
  evaluatedStates,
  formValues,
  depth = 0,
}) => {
  const state = evaluatedStates[field.name];
  const isVisible = state ? state.visible : true;
  const isRequired = state ? state.required : field.required;
  const error = errors[field.name] as any;
  const currentValue = formValues[field.name];

  if (!isVisible) {
    return null;
  }

  const registerProps = register(field.name);

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <SelectField
            field={field}
            registerProps={registerProps}
            error={error}
            isRequired={isRequired}
          />
        );
      case 'option':
        return (
          <OptionField
            field={field}
            registerProps={registerProps}
            error={error}
            currentValue={currentValue}
            isRequired={isRequired}
          />
        );
      case 'free_text':
      default:
        return (
          <TextField
            field={field}
            registerProps={registerProps}
            error={error}
            isRequired={isRequired}
          />
        );
    }
  };

  const colSpanClass = field.grid_span === 2 ? 'col-span-1 md:col-span-2' : 'col-span-1';

  return (
    <div
      className={`${colSpanClass} transition-all duration-300 animate-fadeIn`}
      data-field-name={field.name}
      data-field-depth={depth}
    >
      <div
        className={`${
          depth > 0
            ? 'pl-3 sm:pl-4 border-l-2 border-indigo-200 my-2'
            : ''
        }`}
      >
        {renderInput()}

        {field.children && field.children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {field.children.map(child => (
              <DynamicField
                key={child.id || child.name}
                field={child}
                register={register}
                errors={errors}
                evaluatedStates={evaluatedStates}
                formValues={formValues}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
