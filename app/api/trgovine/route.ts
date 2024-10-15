import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Trgovine');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trgovine' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime_trgovine, adresa } = await request.json();

  try {
    const [result]: any = await connection.execute('INSERT INTO Trgovine (ime_trgovine, adresa) VALUES (?, ?)', [ime_trgovine, adresa]);
    return NextResponse.json({ id: result.insertId, ime_trgovine, adresa }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add trgovina' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM Trgovine WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Trgovina deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trgovina' }, { status: 500 });
  }
}