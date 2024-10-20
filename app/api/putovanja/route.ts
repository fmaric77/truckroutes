import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT 
        p.id, 
        p.datum, 
        v.ime_vozaca AS vozac_ime, 
        v.prezime_vozaca AS vozac_prezime, 
        k.registracija, 
        sr.ruta 
      FROM 
        Putovanja p
      JOIN 
        Vozaci v ON p.vozac_id = v.id
      JOIN 
        Kamioni k ON p.kamion_id = k.id
      JOIN 
        SpremneRute sr ON p.ruta_id = sr.id
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      datum: new Date(row.datum).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.')
    }));
    return NextResponse.json(formattedRows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch putovanja' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { datum, vozac_id, kamion_id, ruta_id } = await request.json();
  try {
    const [result]: any = await connection.execute('INSERT INTO Putovanja (datum, vozac_id, kamion_id, ruta_id) VALUES (?, ?, ?, ?)', [datum, vozac_id, kamion_id, ruta_id]);
    return NextResponse.json({ id: result.insertId, datum, vozac_id, kamion_id, ruta_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add putovanje' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, datum, vozac_id, kamion_id, ruta_id } = await request.json();
  try {
    await connection.execute('UPDATE Putovanja SET datum = ?, vozac_id = ?, kamion_id = ?, ruta_id = ? WHERE id = ?', [datum, vozac_id, kamion_id, ruta_id, id]);
    return NextResponse.json({ id, datum, vozac_id, kamion_id, ruta_id });
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