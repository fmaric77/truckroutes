import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM Administratori');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch administrators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { ime, lozinka } = await request.json();

  try {
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    const [result]: any = await connection.execute('INSERT INTO Administratori (ime, lozinka) VALUES (?, ?)', [ime, hashedLozinka]);
    return NextResponse.json({ id: result.insertId, ime }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add administrator' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const { id } = await request.json();

    // First check if admin exists
    const [admins]: any = await connection.execute(
      'SELECT * FROM Administratori WHERE id = ?', 
      [id]
    );

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: 'Administrator not found' }, 
        { status: 404 }
      );
    }

    // Perform delete
    await connection.execute(
      'DELETE FROM Administratori WHERE id = ?', 
      [id]
    );

    return NextResponse.json({ message: 'Administrator deleted successfully' });

  } catch (error: any) {
    console.error('Delete admin error:', error); // Add error logging
    return NextResponse.json(
      { error: 'Failed to delete administrator', details: error.message }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end(); // Properly close connection
    }
  }
}