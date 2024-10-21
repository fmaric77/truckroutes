import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Skladista');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skladista' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { naziv_skladista, lozinka_skladista } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka_skladista, 10);
    const [result]: any = await connection.execute('INSERT INTO Skladista (naziv_skladista, lozinka_skladista) VALUES (?, ?)', [naziv_skladista, hashedLozinka]);
    return NextResponse.json({ id: result.insertId, naziv_skladista }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add skladiste' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute('DELETE FROM Skladista WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Skladiste deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete skladiste' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, naziv_skladista } = await request.json();

  try {
    await connection.execute('UPDATE Skladista SET naziv_skladista = ? WHERE id = ?', [naziv_skladista, id]);
    const [updatedSkladiste]: [Array<{ [key: string]: any }>] = await connection.execute('SELECT * FROM Skladista WHERE id = ?', [id]);
    return NextResponse.json(updatedSkladiste[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update skladiste' }, { status: 500 });
  }
}