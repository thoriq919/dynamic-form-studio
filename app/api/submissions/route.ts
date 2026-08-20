import { NextResponse } from 'next/server';
import { getFormSubmissions } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId') || undefined;

    const submissions = await getFormSubmissions(formId);
    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengambil data submission' },
      { status: 500 }
    );
  }
}
