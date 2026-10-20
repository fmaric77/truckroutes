import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { openTripSql } from '../../lib/openTrip';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Vozac extends RowDataPacket {
  id: number;
  ime_vozaca: string;
  prezime_vozaca: string;
  oib_vozaca: string;
  lozinka_vozaca: string;
  status?: string;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Vozac[]>(`
      SELECT
        v.*,
        (
          SELECT k.registracija
          FROM Putovanja p
          JOIN Kamioni k ON k.id = p.kamion_id
          WHERE p.vozac_id = v.id
            AND (p.datum >= CURDATE() OR ${openTripSql})
          ORDER BY
            (${openTripSql}) DESC,
            IF(${openTripSql}, p.datum, '9999-12-31') DESC,
            p.datum ASC,
            p.id ASC
          LIMIT 1
        ) AS kamion,
        (
          SELECT DATE_FORMAT(p.datum, '%d.%m.%Y')
          FROM Putovanja p
          WHERE p.vozac_id = v.id
            AND (p.datum >= CURDATE() OR ${openTripSql})
          ORDER BY
            (${openTripSql}) DESC,
            IF(${openTripSql}, p.datum, '9999-12-31') DESC,
            p.datum ASC,
            p.id ASC
          LIMIT 1
        ) AS kamion_datum
      FROM Vozaci v
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching vozaci:', error);
    return NextResponse.json({ error: 'Failed to fetch vozaci' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka_vozaca, 10);
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Vozaci (ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca) VALUES (?, ?, ?, ?)',
      [ime_vozaca, prezime_vozaca, oib_vozaca, hashedLozinka]
    );
    return NextResponse.json({ id: result.insertId, ime_vozaca, prezime_vozaca, oib_vozaca }, { status: 201 });
  } catch (error) {
    console.error('Error adding vozac:', error);
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
    console.error('Error deleting vozac:', error);
    return NextResponse.json({ error: 'Failed to delete vozac' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, status } = await request.json();

  try {
    await connection.execute('UPDATE Vozaci SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await connection.execute<Vozac[]>('SELECT * FROM Vozaci WHERE id = ?', [id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating vozac status:', error);
    return NextResponse.json({ error: 'Failed to update vozac status' }, { status: 500 });
  }
}