import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Store extends RowDataPacket {
  id: number;
  ime_trgovine: string;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Store[]>('SELECT * FROM SpremneRute');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error in GET /api/rute:', error);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { selectedStores, opis } = await request.json();

  try {
    const placeholders = selectedStores.map(() => '?').join(',');

    const [stores] = await connection.execute<RowDataPacket[] & Store[]>(
      `SELECT id, ime_trgovine FROM Trgovine WHERE id IN (${placeholders})`,
      selectedStores
    );

    const storeMap = new Map(stores.map((store: Store) => [store.id.toString(), store.ime_trgovine]));

    const ruta = selectedStores.map((id: number) => storeMap.get(id.toString()) || id).join(', ');

    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO SpremneRute (ruta, opis) VALUES (?, ?)',
      [ruta, opis]
    );

    return NextResponse.json({ id: result.insertId, ruta, opis }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/rute:', error);
    return NextResponse.json({ error: 'Failed to add route' }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM SpremneRute WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/rute:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  } finally {
    await connection.end();
  }
}