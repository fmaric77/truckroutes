import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Kamion extends RowDataPacket {
  id: number;
  registracija: string;
  datum_registracije: Date;
  status: string;
  skladiste: string | null;
  vozac: string | null;
  vozac_datum: string | null;
  rampa: string | null;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Kamion[]>(`
      SELECT
        k.id,
        k.registracija,
        k.datum_registracije,
        k.status,
        GROUP_CONCAT(DISTINCT s.naziv_skladista ORDER BY s.naziv_skladista SEPARATOR ', ') AS skladiste,
        GROUP_CONCAT(DISTINCT ks.rampa ORDER BY ks.rampa SEPARATOR ', ') AS rampa,
        (
          SELECT CONCAT(v.ime_vozaca, ' ', v.prezime_vozaca)
          FROM Putovanja p
          JOIN Vozaci v ON v.id = p.vozac_id
          WHERE p.kamion_id = k.id AND p.datum >= CURDATE()
          ORDER BY p.datum ASC
          LIMIT 1
        ) AS vozac,
        (
          SELECT DATE_FORMAT(p.datum, '%d.%m.%Y')
          FROM Putovanja p
          WHERE p.kamion_id = k.id AND p.datum >= CURDATE()
          ORDER BY p.datum ASC
          LIMIT 1
        ) AS vozac_datum
      FROM Kamioni k
      LEFT JOIN KamioniNaSkladistu ks ON ks.kamion_id = k.id
      LEFT JOIN Skladista s ON s.id = ks.skladiste_id
      GROUP BY k.id, k.registracija, k.datum_registracije, k.status
    `);
    const formattedRows = rows.map(row => ({
      ...row,
      skladiste: row.skladiste || null,
      rampa: row.rampa || null,
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
  } finally {
    await connection.end();
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