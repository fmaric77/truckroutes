import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Administratori');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch administrators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime, lozinka } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    const [result]: any = await connection.execute('INSERT INTO Administratori (ime, lozinka) VALUES (?, ?)', [ime, hashedLozinka]);
    return NextResponse.json({ id: result.insertId, ime }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add administrator' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM Administratori WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Administrator deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete administrator' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, lozinka } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    await connection.execute('UPDATE Administratori SET lozinka = ? WHERE id = ?', [hashedLozinka, id]);
    const [updatedAdmin]: [Array<{ [key: string]: any }>] = await connection.execute('SELECT * FROM Administratori WHERE id = ?', [id]);
    return NextResponse.json(updatedAdmin[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update administrator' }, { status: 500 });
  }
}