export default async function handler(req, res) {
  const key = process.env.GOOGLE_CALENDAR_API_KEY;
  const calId = process.env.GOOGLE_CALENDAR_ID;

  if (!key || !calId) {
    return res.status(500).json({ error: 'Calendar not configured' });
  }

  const now = new Date().toISOString();
  const max = Math.min(parseInt(req.query.max || '20', 10), 50);

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/` +
    `${encodeURIComponent(calId)}/events` +
    `?key=${encodeURIComponent(key)}` +
    `&timeMin=${encodeURIComponent(now)}` +
    `&maxResults=${max}` +
    `&singleEvents=true` +
    `&orderBy=startTime`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: err.error?.message || 'Calendar API error' });
    }
    const data = await resp.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to reach Google Calendar' });
  }
}
