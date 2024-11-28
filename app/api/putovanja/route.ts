import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';

interface PutovanjeRow extends RowDataPacket {
  id: number;
  datum: Date;
  vozac_ime: string;
  vozac_prezime: string;
  registracija: string;
  ruta: string;
}

interface PutovanjeInput {
  id?: number;
  datum: string;
  vozac_id: number;
  kamion_id: number;
  ruta_id: number;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const currentDate = new Date();

    const [rows]: [PutovanjeRow[], FieldPacket[]] = await connection.execute<PutovanjeRow[]>(`
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
      WHERE 
        v.status != 'neaktivan'
    `);

    const futureTrips: PutovanjeRow[] = [];

    for (const row of rows) {
      const tripDate = new Date(row.datum);
      if (tripDate < currentDate) {
        const tripInfo = `Datum: ${tripDate.toISOString().split('T')[0]}, Vozač: ${row.vozac_ime} ${row.vozac_prezime}, Kamion: ${row.registracija}, Ruta: ${row.ruta}`;
        
        // Save the concatenated string to PovijestPutovanja
        await connection.execute<ResultSetHeader>(
          'INSERT INTO PovijestPutovanja (tekst) VALUES (?)',
          [tripInfo]
        );

        // Remove the past trip from Putovanja
        await connection.execute(
          'DELETE FROM Putovanja WHERE id = ?',
          [row.id]
        );
      } else {
        futureTrips.push(row);
      }
    }

    const formattedRows = futureTrips.map((row) => ({
      ...row,
      datum: new Date(row.datum).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.')
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error('Failed to fetch putovanja:', error);
    return NextResponse.json({ error: 'Failed to fetch putovanja' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const data: PutovanjeInput = await request.json();
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Putovanja (datum, vozac_id, kamion_id, ruta_id) VALUES (?, ?, ?, ?)',
      [data.datum, data.vozac_id, data.kamion_id, data.ruta_id]
    );
    return NextResponse.json({ id: result.insertId, ...data }, { status: 201 });
  } catch (error) {
    console.error('Failed to add putovanje:', error);
    return NextResponse.json({ error: 'Failed to add putovanje' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const data: PutovanjeInput = await request.json();
  try {
    await connection.execute(
      'UPDATE Putovanja SET datum = ?, vozac_id = ?, kamion_id = ?, ruta_id = ? WHERE id = ?',
      [data.datum, data.vozac_id, data.kamion_id, data.ruta_id, data.id]
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update putovanje:', error);
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
    console.error('Failed to delete putovanje:', error);
    return NextResponse.json({ error: 'Failed to delete putovanje' }, { status: 500 });
  }
}