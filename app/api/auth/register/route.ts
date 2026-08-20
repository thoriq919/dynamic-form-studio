import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const result = await registerUser(username, password, name || username, 'responder');

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Pendaftaran gagal' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.user,
      message: 'Registrasi berhasil, akun responder telah dibuat',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
