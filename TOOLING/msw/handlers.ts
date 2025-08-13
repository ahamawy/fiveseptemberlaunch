import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example: GET /api/deals/:id
  http.get('/api/deals/:id', ({ params }) => {
    const id = Number(params.id);
    if (id === 999999) return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json({ id, name: 'Alpha', stage: 'live', identifiers: { aliases: [] } });
  }),
];
