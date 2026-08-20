import { NextResponse } from 'next/server';
import { initialFormsData } from '@/lib/seedData';
import { saveForm } from '@/lib/db';

export async function POST() {
  try {
    for (const form of initialFormsData) {
      await saveForm(form);
    }
    return NextResponse.json({
      success: true,
      message: 'Seed demo forms berhasil diinisialisasi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal melakukan seeding' },
      { status: 500 }
    );
  }
}
