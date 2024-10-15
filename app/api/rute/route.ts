import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM SpremneRute');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { selectedStores, opis } = await request.json();

  try {
    // Create placeholders for the IN clause
    const placeholders = selectedStores.map(() => '?').join(',');

    // Fetch store names based on the provided IDs
    const [stores]: any = await connection.execute(
      `SELECT id, ime_trgovine FROM Trgovine WHERE id IN (${placeholders})`,
      selectedStores
    );

    // Create a map of id to ime_trgovine
    const storeMap = new Map(stores.map((store: { id: number, ime_trgovine: string }) => [store.id.toString(), store.ime_trgovine]));

    // Create the route string using the original order of selectedStores
    const ruta = selectedStores.map((id: number) => storeMap.get(id.toString()) || id).join(', ');

    // Save the concatenated store names in the ruta field
    const [result]: any = await connection.execute(
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
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  } finally {
    await connection.end();
  }
}