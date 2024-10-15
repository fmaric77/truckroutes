import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Putovanja');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch putovanja' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { datum, vozac_id, kamion_id, ruta } = await request.json();
  try {
    const [result]: any = await connection.execute('INSERT INTO Putovanja (datum, vozac_id, kamion_id, ruta) VALUES (?, ?, ?, ?)', [datum, vozac_id, kamion_id, ruta]);
    return NextResponse.json({ id: result.insertId, datum, vozac_id, kamion_id, ruta }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add putovanje' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, datum, vozac_id, kamion_id, ruta } = await request.json();
  try {
    await connection.execute('UPDATE Putovanja SET datum = ?, vozac_id = ?, kamion_id = ?, ruta = ? WHERE id = ?', [datum, vozac_id, kamion_id, ruta, id]);
    return NextResponse.json({ id, datum, vozac_id, kamion_id, ruta });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update putovanje' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();
  try {
    await connection.execute('DELETE FROM Putovanja WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Putovanje deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete putovanje' }, { status: 500 });
  }
}