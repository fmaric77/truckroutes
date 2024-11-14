import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Trgovina extends RowDataPacket {
  id: number;
  ime_trgovine: string;
  adresa: string;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Trgovina[]>('SELECT * FROM Trgovine');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching trgovine:', error);
    return NextResponse.json({ error: 'Failed to fetch trgovine' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime_trgovine, adresa } = await request.json();

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Trgovine (ime_trgovine, adresa) VALUES (?, ?)',
      [ime_trgovine, adresa]
    );
    return NextResponse.json({ id: result.insertId, ime_trgovine, adresa }, { status: 201 });
  } catch (error) {
    console.error('Error adding trgovina:', error);
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
    console.error('Error deleting trgovina:', error);
    return NextResponse.json({ error: 'Failed to delete trgovina' }, { status: 500 });
  }
}