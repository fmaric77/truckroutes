import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';

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
  const { ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka_vozaca, 10);
    const [result]: any = await connection.execute('INSERT INTO Vozaci (ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca) VALUES (?, ?, ?, ?)', [ime_vozaca, prezime_vozaca, oib_vozaca, hashedLozinka]);
    return NextResponse.json({ id: result.insertId, ime_vozaca, prezime_vozaca, oib_vozaca }, { status: 201 });
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

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, status } = await request.json();

  try {
    await connection.execute('UPDATE Vozaci SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await connection.execute('SELECT * FROM Vozaci WHERE id = ?', [id]);
    const updatedDriver = rows as any[];
    return NextResponse.json(updatedDriver[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update vozac status' }, { status: 500 });
  }
}