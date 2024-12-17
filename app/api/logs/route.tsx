// app/api/logs/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db'; 
export async function POST(req: Request) {
  const { action, adminId } = await req.json();

  if (!adminId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connection = await getConnection();
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); 
    await connection.execute(
      'INSERT INTO Logs (admin_id, action, timestamp) VALUES (?, ?, ?)',
      [adminId, action, timestamp]
    );
    await connection.end();

    return NextResponse.json({ message: 'Log created successfully' });
  } catch (error) {
    console.error('Error logging action:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const connection = await getConnection();
    const [logs] = await connection.execute('SELECT * FROM Logs');
    await connection.end();

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}