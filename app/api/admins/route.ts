import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Administrator extends RowDataPacket {
  id: number;
  ime: string;
  lozinka: string;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Administrator[]>('SELECT * FROM Administratori');
    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error('Error fetching administrators:', error);
    return NextResponse.json({ error: 'Failed to fetch administrators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime, lozinka } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Administratori (ime, lozinka) VALUES (?, ?)',
      [ime, hashedLozinka]
    );
    return NextResponse.json({ id: result.insertId, ime }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding administrator:', error);
    return NextResponse.json({ error: 'Failed to add administrator' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const { id } = await request.json();

    const [admins] = await connection.execute<Administrator[]>(
      'SELECT * FROM Administratori WHERE id = ?', 
      [id]
    );

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: 'Administrator not found' }, 
        { status: 404 }
      );
    }

    await connection.execute(
      'DELETE FROM Administratori WHERE id = ?', 
      [id]
    );

    return NextResponse.json({ message: 'Administrator deleted successfully' });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete admin error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete administrator', details: errorMessage }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const { id, lozinka } = await request.json();

    if (!id || !lozinka) {
      return NextResponse.json(
        { error: 'ID and new password are required' },
        { status: 400 }
      );
    }

    const [admins] = await connection.execute<Administrator[]>(
      'SELECT * FROM Administratori WHERE id = ?',
      [id]
    );

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: 'Administrator not found' },
        { status: 404 }
      );
    }

    const hashedLozinka = await bcrypt.hash(lozinka, 10);

    await connection.execute(
      'UPDATE Administratori SET lozinka = ? WHERE id = ?',
      [hashedLozinka, id]
    );

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update password error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update password', details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}