import { NextResponse } from 'next/server';
import { getAllForms, saveForm } from '@/lib/db';

export async function GET() {
  try {
    const forms = await getAllForms();
    return NextResponse.json({
      success: true,
      data: forms,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengambil daftar form' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Nama form wajib diisi' },
        { status: 400 }
      );
    }

    const created = await saveForm(body);
    return NextResponse.json({
      success: true,
      data: created,
      message: 'Form berhasil dibuat',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal membuat form' },
      { status: 500 }
    );
  }
}
