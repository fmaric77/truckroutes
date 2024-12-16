// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';
import { RowDataPacket, FieldPacket } from 'mysql2/promise';

interface AdminRow extends RowDataPacket {
  ime: string;
  lozinka: string;
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  try {
    const connection = await getConnection();

    
    const [adminRows]: [AdminRow[], FieldPacket[]] = await connection.execute<AdminRow[]>(
      'SELECT * FROM Administratori WHERE ime = ?',
      [username]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const isPasswordMatch = await bcrypt.compare(password, admin.lozinka);

      if (isPasswordMatch) {
        await connection.end();
        return NextResponse.json({ message: 'Login successful', admin, role: 'admin' });
      }
    }

    await connection.end();
    return NextResponse.json({ message: 'Pogrešno korisničko ime ili lozinka' }, { status: 401 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}