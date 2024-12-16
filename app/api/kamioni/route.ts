import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Kamion extends RowDataPacket {
  id: number;
  registracija: string;
  datum_registracije: Date;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Kamion[]>('SELECT * FROM Kamioni');
    const formattedRows = rows.map(row => ({
      ...row,
      datum_registracije: new Date(row.datum_registracije).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.')
    }));
    return NextResponse.json(formattedRows);
  } catch (error: unknown) {
    console.error('Error fetching kamioni:', error);
    return NextResponse.json({ error: 'Failed to fetch kamioni' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { registracija, datum_registracije } = await request.json();

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Kamioni (registracija, datum_registracije) VALUES (?, ?)',
      [registracija, datum_registracije]
    );
    return NextResponse.json({ id: result.insertId, registracija, datum_registracije }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding kamion:', error);
    return NextResponse.json({ error: 'Failed to add kamion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute<ResultSetHeader>('DELETE FROM Kamioni WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Kamion deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting kamion:', error);
    return NextResponse.json({ error: 'Failed to delete kamion' }, { status: 500 });
  }
}