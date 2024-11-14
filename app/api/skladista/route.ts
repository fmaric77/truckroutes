import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Skladiste extends RowDataPacket {
  id: number;
  naziv_skladista: string;
  lozinka_skladista: string;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Skladiste[]>('SELECT * FROM Skladista');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching skladista:', error);
    return NextResponse.json({ error: 'Failed to fetch skladista' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { naziv_skladista, lozinka_skladista } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka_skladista, 10);
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Skladista (naziv_skladista, lozinka_skladista) VALUES (?, ?)',
      [naziv_skladista, hashedLozinka]
    );
    return NextResponse.json({ id: result.insertId, naziv_skladista }, { status: 201 });
  } catch (error) {
    console.error('Error adding skladiste:', error);
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
    console.error('Error deleting skladiste:', error);
    return NextResponse.json({ error: 'Failed to delete skladiste' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  const { id, naziv_skladista } = await request.json();

  try {
    await connection.execute('UPDATE Skladista SET naziv_skladista = ? WHERE id = ?', [naziv_skladista, id]);
    const [updatedSkladiste] = await connection.execute<Skladiste[]>('SELECT * FROM Skladista WHERE id = ?', [id]);
    return NextResponse.json(updatedSkladiste[0]);
  } catch (error) {
    console.error('Error updating skladiste:', error);
    return NextResponse.json({ error: 'Failed to update skladiste' }, { status: 500 });
  }
}