// app/api/povijestputovanja/route.ts

import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { getConnection } from '../../lib/db';
import { dayKey, eventsThroughClose, loadDogadaji, summaryFor } from '../../lib/dogadaji'; 
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  let query = 'SELECT * FROM PovijestPutovanja WHERE 1=1';
  const queryParams: string[] = [];

  params.forEach((value, key) => {
    if (value) {
      query += ` AND ${key} = ?`;
      queryParams.push(value);
    }
  });

  try {
    const connection = await getConnection();
    const [putovanja] = await connection.execute<RowDataPacket[]>(query, queryParams);
    const { events, now } = await loadDogadaji(connection);
    await connection.end();

    const withTimes = putovanja.map((row) => {
      const dan = dayKey(row.datum);
      const matched = events.filter((event) => event.registracija === row.registracija && event.dan === dan);
      const truckEvents = events.filter((event) => event.registracija === row.registracija);
      const summary = summaryFor(eventsThroughClose(matched), now, truckEvents);
      return { ...row, trajanje: summary.trajanje, tijek: summary.tijek };
    });

    return NextResponse.json(withTimes);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}