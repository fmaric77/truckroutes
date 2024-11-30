// app/api/povijestputovanja/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db'; // Adjust the path as necessary

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  let query = 'SELECT * FROM PovijestPutovanja WHERE 1=1';
  const queryParams: any[] = [];

  params.forEach((value, key) => {
    if (value) {
      query += ` AND ${key} = ?`;
      queryParams.push(value);
    }
  });

  try {
    const connection = await getConnection();
    const [putovanja] = await connection.execute(query, queryParams);
    await connection.end();

    return NextResponse.json(putovanja);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}