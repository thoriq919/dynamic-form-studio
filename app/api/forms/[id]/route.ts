import { NextResponse } from 'next/server';
import { getFormById, saveForm, deleteForm } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const form = await getFormById(id);

    if (!form) {
      return NextResponse.json(
        { success: false, message: `Form dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: form,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengambil form' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    body.id = Number(id);

    const updated = await saveForm(body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Form berhasil diperbarui',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memperbarui form' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await deleteForm(id);
    return NextResponse.json({
      success: true,
      message: 'Form berhasil dihapus',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menghapus form' },
      { status: 500 }
    );
  }
}
