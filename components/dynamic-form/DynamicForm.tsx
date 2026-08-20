'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormConfig } from '@/types/form';
import { buildFieldTree, evaluateFieldStates, flattenFieldTree } from '@/lib/rules';
import { generateDynamicZodSchema } from '@/lib/validation';
import { DynamicField } from './DynamicField';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';

interface DynamicFormProps {
  formConfig: FormConfig;
  onSubmitSuccess?: (result: any) => void;
  showInspector?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formConfig,
  onSubmitSuccess,
  showInspector = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fieldTree = useMemo(() => {
    return buildFieldTree(formConfig.fields || []);
  }, [formConfig.fields]);

  const defaultValues = useMemo(() => {
    const flat = flattenFieldTree(formConfig.fields || []);
    const defaults: Record<string, any> = {};
    flat.forEach(f => {
      defaults[f.name] = '';
    });
    return defaults;
  }, [formConfig.fields]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const watchedValues = watch();

  const evaluatedStates = useMemo(() => {
    return evaluateFieldStates(formConfig.fields || [], watchedValues);
  }, [formConfig.fields, watchedValues]);

  const onFormSubmit = async (data: Record<string, any>) => {
    setSubmitError(null);
    clearErrors();

    const dynamicSchema = generateDynamicZodSchema(formConfig.fields || [], evaluatedStates);
    const validationResult = dynamicSchema.safeParse(data);

    if (!validationResult.success) {
      validationResult.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        if (fieldName) {
          setError(fieldName, {
            type: 'manual',
            message: issue.message,
          });
        }
      });
      return;
    }

    const cleanedData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      const state = evaluatedStates[key];
      if (state && state.visible) {
        cleanedData[key] = data[key];
      }
    });

    let currentUser: any = null;
    try {
      const stored = localStorage.getItem('df_auth_user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {}

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formConfig.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: cleanedData,
          formConfig,
          user: currentUser,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Failed to submit form');
      }

      setSubmittedData(cleanedData);
      if (onSubmitSuccess) {
        onSubmitSuccess(json.data || json);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setSubmittedData(null);
    setSubmitError(null);
    clearErrors();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-1 mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {formConfig.name}
        </h1>
        {formConfig.description && (
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {formConfig.description}
          </p>
        )}
      </div>

      {submittedData ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Submission Successful!</h3>
            <p className="text-xs text-slate-500">
              Your form responses have been saved to the database.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit Another Response</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
        >
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-5">
            {fieldTree.map(rootField => (
              <DynamicField
                key={rootField.id || rootField.name}
                field={rootField}
                register={register}
                errors={errors}
                evaluatedStates={evaluatedStates}
                formValues={watchedValues}
                depth={0}
              />
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Form</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
