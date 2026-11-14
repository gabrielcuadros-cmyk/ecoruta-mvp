import { NextResponse } from 'next/server';

// Redirección 303 (POST → GET) conservando el host de la petición.
export function go(req, path, params) {
  const url = new URL(path, req.url);
  if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  return NextResponse.redirect(url, 303);
}
