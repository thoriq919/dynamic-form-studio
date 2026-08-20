import { NextResponse } from 'next/server';
import { getFormById, saveFormSubmission } from '@/lib/db';
import { evaluateFieldStates } from '@/lib/rules';
import { generateDynamicZodSchema } from '@/lib/validation';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const form = await getFormById(formId);

    if (!form) {
      return NextResponse.json(
        { success: false, message: 'Form tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const submissionData = body.data || {};

    const evaluatedStates = evaluateFieldStates(form.fields, submissionData);
    const dynamicSchema = generateDynamicZodSchema(form.fields, evaluatedStates);
    const parseResult = dynamicSchema.safeParse(submissionData);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasi form gagal',
          errors: parseResult.error.flatten(),
        },
        { status: 422 }
      );
    }

    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(submissionData)) {
      const state = evaluatedStates[key];
      if (state && state.visible) {
        cleanData[key] = value;
      }
    }

    const saved = await saveFormSubmission(formId, cleanData);

    return NextResponse.json({
      success: true,
      message: 'Form submission berhasil disimpan ke database',
      data: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menyimpan submission' },
      { status: 500 }
    );
  }
}
