import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { eventsAfterClose, eventsForTrips, eventsThroughClose, loadDogadaji, servisFor, summaryFor } from '../../lib/dogadaji';
import { openTripSql } from '../../lib/openTrip';

interface Kamion extends RowDataPacket {
  id: number;
  registracija: string;
  datum_registracije: Date;
  status: string;
  skladiste: string | null;
  vozac: string | null;
  vozac_datum: string | null;
  rampa: string | null;
}

export async function GET() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute<Kamion[]>(`
      SELECT
        k.id,
        k.registracija,
        k.datum_registracije,
        k.status,
        GROUP_CONCAT(DISTINCT s.naziv_skladista ORDER BY s.naziv_skladista SEPARATOR ', ') AS skladiste,
        GROUP_CONCAT(DISTINCT ks.rampa ORDER BY ks.rampa SEPARATOR ', ') AS rampa,
        (
          SELECT CONCAT(v.ime_vozaca, ' ', v.prezime_vozaca)
          FROM Putovanja p
          JOIN Vozaci v ON v.id = p.vozac_id
          WHERE p.kamion_id = k.id AND p.datum >= CURDATE()
          ORDER BY p.datum ASC
          LIMIT 1
        ) AS vozac,
        (
          SELECT DATE_FORMAT(p.datum, '%d.%m.%Y')
          FROM Putovanja p
          WHERE p.kamion_id = k.id AND p.datum >= CURDATE()
          ORDER BY p.datum ASC
          LIMIT 1
        ) AS vozac_datum
      FROM Kamioni k
      LEFT JOIN KamioniNaSkladistu ks ON ks.kamion_id = k.id
      LEFT JOIN Skladista s ON s.id = ks.skladiste_id
      GROUP BY k.id, k.registracija, k.datum_registracije, k.status
    `);
    const { events, now } = await loadDogadaji(connection);
    const [tripRows] = await connection.execute<RowDataPacket[]>(`
      SELECT
        p.id,
        p.kamion_id,
        DATE_FORMAT(p.datum, '%Y-%m-%d') AS dan,
        DATE_FORMAT(p.datum, '%d.%m.%Y') AS datum_prikaz,
        CONCAT(v.ime_vozaca, ' ', v.prezime_vozaca) AS vozac,
        (
          SELECT d.dogadaj
          FROM Dogadaji d
          WHERE d.putovanje_id = p.id
          ORDER BY d.vrijeme DESC, d.id DESC
          LIMIT 1
        ) AS zadnji
      FROM Putovanja p
      JOIN Vozaci v ON v.id = p.vozac_id
      WHERE p.datum >= CURDATE()
         OR ${openTripSql}
      ORDER BY p.datum ASC, p.id ASC
    `);
    const today = now.slice(0, 10);
    const openStatuses = new Set(['U procesu utovara', 'Utovaren', 'Otpremljen']);
    const tripsByTruck = new Map<number, RowDataPacket[]>();
    for (const trip of tripRows) {
      const list = tripsByTruck.get(trip.kamion_id) ?? [];
      list.push(trip);
      tripsByTruck.set(trip.kamion_id, list);
    }
    const nextByTruck = new Map<number, { id: number; kamion_id: number; dan: string; vozac: string; datum_prikaz: string }>();
    tripsByTruck.forEach((list, kamionId) => {
      const openTrips = list.filter((trip) => openStatuses.has(trip.zadnji));
      const trip = openTrips.length ? openTrips[openTrips.length - 1] : list.find((item) => item.dan >= today);
      if (!trip) return;
      nextByTruck.set(kamionId, {
        id: trip.id,
        kamion_id: trip.kamion_id,
        dan: String(trip.dan),
        vozac: String(trip.vozac),
        datum_prikaz: String(trip.datum_prikaz),
      });
    });
    const grouped = eventsForTrips(events, Array.from(nextByTruck.values()));

    const formattedRows = rows.map(row => {
      const trip = nextByTruck.get(row.id);
      const tripEvents = eventsThroughClose(trip ? grouped.get(trip.id) ?? [] : []);
      const truckEvents = events.filter((event) => event.kamion_id === row.id);
      const newer = eventsAfterClose(tripEvents, truckEvents);
      const shown = newer.length
        ? newer
        : tripEvents.length
          ? tripEvents
          : truckEvents.filter((event) => event.dan === today);
      const summary = summaryFor(shown, now, truckEvents);
      const servis = servisFor(truckEvents, now);
      const trajanje = summary.trajanje.includes('Servis') || !servis
        ? summary.trajanje
        : [summary.trajanje, servis].filter(Boolean).join(' · ');
      return {
        ...row,
        skladiste: row.skladiste || null,
        rampa: row.rampa || null,
        vozac: trip ? trip.vozac : row.vozac,
        vozac_datum: trip ? trip.datum_prikaz : row.vozac_datum,
        datum_registracije: new Date(row.datum_registracije).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '.'),
        trajanje,
        tijek: summary.tijek,
      };
    });
    return NextResponse.json(formattedRows);
  } catch (error: unknown) {
    console.error('Error fetching kamioni:', error);
    return NextResponse.json({ error: 'Failed to fetch kamioni' }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { registracija, datum_registracije } = await request.json();

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO Kamioni (registracija, datum_registracije) VALUES (?, ?)',
      [registracija, datum_registracije]
    );
    return NextResponse.json({ id: result.insertId, registracija, datum_registracije }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding kamion:', error);
    return NextResponse.json({ error: 'Failed to add kamion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await getConnection();
  const { id } = await request.json();

  try {
    await connection.execute<ResultSetHeader>('DELETE FROM Kamioni WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Kamion deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting kamion:', error);
    return NextResponse.json({ error: 'Failed to delete kamion' }, { status: 500 });
  }
}