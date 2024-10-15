import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Vozaci');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vozaci' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime, prezime, oib, lozinka } = await request.json();

  try {
    const [result]: any = await connection.execute('INSERT INTO Vozaci (ime, prezime, oib, lozinka) VALUES (?, ?, ?, ?)', [ime, prezime, oib, lozinka]);
    return NextResponse.json({ id: result.insertId, ime, prezime, oib }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add vozac' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM Vozaci WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Vozac deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vozac' }, { status: 500 });
  }
}