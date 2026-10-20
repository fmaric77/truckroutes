import { RowDataPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';
import { returnEndAfter, servisTekst, tekst, tijek } from './trajanje';

export interface StoredDogadaj extends RowDataPacket {
  id: number;
  kamion_id: number;
  putovanje_id: number | null;
  dogadaj: string;
  registracija: string;
  vrijeme: string;
  dan: string | null;
}

export interface TripKey {
  id: number;
  kamion_id: number;
  dan: string;
}

export async function loadDogadaji(connection: Connection) {
  const [events] = await connection.execute<StoredDogadaj[]>(`
    SELECT
      d.id,
      d.kamion_id,
      d.putovanje_id,
      d.dogadaj,
      k.registracija,
      DATE_FORMAT(d.vrijeme, '%Y-%m-%d %H:%i:%s') AS vrijeme,
      DATE_FORMAT(d.putovanje_datum, '%Y-%m-%d') AS dan
    FROM Dogadaji d
    JOIN Kamioni k ON k.id = d.kamion_id
    ORDER BY d.vrijeme ASC, d.id ASC
  `);
  const [nowRows] = await connection.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS sad`
  );
  return { events, now: String(nowRows[0].sad) };
}

function byTime<T extends { id: number; vrijeme: string }>(events: T[]) {
  return [...events].sort((a, b) => a.vrijeme.localeCompare(b.vrijeme) || a.id - b.id);
}

export function eventsThroughClose<T extends { id: number; dogadaj: string; vrijeme: string }>(events: T[]) {
  const kept: T[] = [];
  let sawWork = false;
  for (const event of byTime(events)) {
    kept.push(event);
    if (event.dogadaj !== 'Dostupan') sawWork = true;
    else if (sawWork) return kept;
  }
  return kept;
}

export function eventsAfterClose<T extends { id: number; dogadaj: string; vrijeme: string }>(
  cycle: T[],
  truckEvents: T[],
) {
  const last = cycle[cycle.length - 1];
  if (!last || last.dogadaj !== 'Dostupan' || !cycle.some((event) => event.dogadaj !== 'Dostupan')) return [];
  return truckEvents.filter((event) =>
    event.vrijeme > last.vrijeme || (event.vrijeme === last.vrijeme && event.id > last.id)
  );
}

function closedBefore(tripEvents: { id: number; dogadaj: string; vrijeme: string }[], event: { id: number; vrijeme: string }) {
  const prior = tripEvents.filter((item) =>
    item.vrijeme < event.vrijeme || (item.vrijeme === event.vrijeme && item.id < event.id)
  );
  const last = prior[prior.length - 1];
  return !!last && last.dogadaj === 'Dostupan' && prior.some((item) => item.dogadaj !== 'Dostupan');
}

export function eventsForTrips(events: StoredDogadaj[], trips: TripKey[]) {
  const grouped = new Map<number, StoredDogadaj[]>(trips.map((trip) => [trip.id, []]));
  const tripsByDay = new Map<string, TripKey[]>();
  for (const trip of trips) {
    const key = `${trip.kamion_id}|${trip.dan}`;
    const list = tripsByDay.get(key) ?? [];
    list.push(trip);
    tripsByDay.set(key, list);
  }
  Array.from(tripsByDay.values()).forEach((list) => list.sort((a, b) => a.id - b.id));

  for (const event of events) {
    if (event.putovanje_id != null && grouped.has(event.putovanje_id)) {
      grouped.get(event.putovanje_id)?.push(event);
    }
  }
  for (const event of events) {
    if (event.putovanje_id != null) continue;
    const candidates = tripsByDay.get(`${event.kamion_id}|${event.dan}`) ?? [];
    const trip = candidates.find((candidate) => !closedBefore(grouped.get(candidate.id) ?? [], event));
    if (trip) grouped.get(trip.id)?.push(event);
  }
  return grouped;
}

export function summaryFor(events: StoredDogadaj[], now: string, truckEvents: StoredDogadaj[] = events) {
  return {
    trajanje: tekst(events, now, returnEndAfter(events, truckEvents)),
    tijek: tijek(events),
  };
}

export function servisFor(events: StoredDogadaj[], now: string) {
  return servisTekst(events, now);
}

export function dayKey(value: unknown) {
  if (!value) return '';
  if (value instanceof Date) {
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${value.getFullYear()}-${month}-${day}`;
  }
  const text = String(value);
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}
