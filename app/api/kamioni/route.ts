import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Kamioni');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch kamioni' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { registracija, datum_registracije } = await request.json();

  try {
    const [result]: any = await connection.execute('INSERT INTO Kamioni (registracija, datum_registracije) VALUES (?, ?)', [registracija, datum_registracije]);
    return NextResponse.json({ id: result.insertId, registracija, datum_registracije }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add kamion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM Kamioni WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Kamion deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete kamion' }, { status: 500 });
  }
}