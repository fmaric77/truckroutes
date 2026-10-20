export interface Dogadaj {
  id: number;
  dogadaj: string;
  vrijeme: string;
}

function minutesBetween(from: string, to: string) {
  const start = Date.parse(from.replace(' ', 'T'));
  const end = Date.parse(to.replace(' ', 'T'));
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
}

function formatMinutes(mins: number) {
  if (mins < 1) return 'manje od 1 min';
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function clock(stamp: string) {
  return stamp.slice(11, 16);
}

function dayClock(stamp: string) {
  return `${stamp.slice(8, 10)}.${stamp.slice(5, 7)} ${clock(stamp)}`;
}

function byTime(events: Dogadaj[]) {
  return [...events].sort((a, b) => a.vrijeme.localeCompare(b.vrijeme) || a.id - b.id);
}

function latestPair(events: Dogadaj[], startName: string, endName: string) {
  let open: Dogadaj | null = null;
  let closed: { od: string; do: string } | null = null;
  for (const event of byTime(events)) {
    if (event.dogadaj === startName) {
      open = event;
    } else if (open && event.dogadaj === endName && event.vrijeme >= open.vrijeme) {
      closed = { od: open.vrijeme, do: event.vrijeme };
      open = null;
    }
  }
  if (open) return { od: open.vrijeme, do: null as string | null };
  return closed;
}

function untilNext(events: Dogadaj[], startName: string, externalEnd?: string | null) {
  let open: Dogadaj | null = null;
  let closed: { od: string; do: string } | null = null;
  for (const event of byTime(events)) {
    if (event.dogadaj === startName) {
      open = event;
    } else if (open && event.vrijeme >= open.vrijeme) {
      closed = { od: open.vrijeme, do: event.vrijeme };
      open = null;
    }
  }
  if (open && externalEnd && externalEnd >= open.vrijeme) {
    return { od: open.vrijeme, do: externalEnd };
  }
  if (open) return { od: open.vrijeme, do: null as string | null };
  return closed;
}

export function returnEndAfter(tripEvents: Dogadaj[], truckEvents: Dogadaj[]) {
  const ordered = byTime(tripEvents);
  const dispatched = [...ordered].reverse().find((event) => event.dogadaj === 'Otpremljen');
  if (!dispatched) return null;
  const closedOnTrip = ordered.some((event) =>
    event.vrijeme > dispatched.vrijeme || (event.vrijeme === dispatched.vrijeme && event.id > dispatched.id)
  );
  if (closedOnTrip) return null;
  const next = byTime(truckEvents).find((event) =>
    event.vrijeme > dispatched.vrijeme || (event.vrijeme === dispatched.vrijeme && event.id > dispatched.id)
  );
  return next?.vrijeme ?? null;
}

function describe(label: string, span: { od: string; do: string | null } | null, now: string) {
  if (!span) return null;
  if (!span.do) {
    return `${label} u tijeku ${formatMinutes(minutesBetween(span.od, now))} od ${clock(span.od)}`;
  }
  const range = span.od.slice(0, 10) === span.do.slice(0, 10)
    ? `${clock(span.od)}–${clock(span.do)}`
    : `${dayClock(span.od)}–${dayClock(span.do)}`;
  return `${label} ${formatMinutes(minutesBetween(span.od, span.do))} (${range})`;
}

export function tekst(events: Dogadaj[], now: string, returnEnd?: string | null) {
  return [
    describe('Utovar', latestPair(events, 'U procesu utovara', 'Utovaren'), now),
    describe('Do otpreme', latestPair(events, 'Utovaren', 'Otpremljen'), now),
    describe('Povratak', untilNext(events, 'Otpremljen', returnEnd), now),
    describe('Servis', untilNext(events, 'Na servisu'), now),
  ].filter(Boolean).join(' · ');
}

export function tijek(events: Dogadaj[]) {
  const ordered = byTime(events);
  const spansDays = new Set(ordered.map((event) => event.vrijeme.slice(0, 10))).size > 1;
  return ordered
    .map((event) => `${spansDays ? dayClock(event.vrijeme) : clock(event.vrijeme)} ${event.dogadaj}`)
    .join(' · ');
}

export function servisTekst(events: Dogadaj[], now: string) {
  return describe('Servis', untilNext(events, 'Na servisu'), now) || '';
}
