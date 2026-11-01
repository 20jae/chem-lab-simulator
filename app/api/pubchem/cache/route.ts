import { NextResponse } from 'next/server';

type PubChemProperty = {
  CID: number;
  Title?: string;
  IUPACName?: string;
  MolecularFormula?: string;
  MolecularWeight?: string;
};

export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase environment variables are not configured.' }, { status: 503 });

  const body = await request.json().catch(() => null) as { cid?: unknown } | null;
  const cid = Number(body?.cid);
  if (!Number.isInteger(cid) || cid <= 0) return NextResponse.json({ error: 'A valid PubChem CID is required.' }, { status: 400 });

  const fields = 'Title,IUPACName,MolecularFormula,MolecularWeight';
  const pubChemResponse = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${fields}/JSON`, { cache: 'no-store' });
  if (!pubChemResponse.ok) return NextResponse.json({ error: 'PubChem verification failed.' }, { status: 502 });

  const payload = await pubChemResponse.json() as { PropertyTable?: { Properties?: PubChemProperty[] } };
  const property = payload.PropertyTable?.Properties?.[0];
  const formula = property?.MolecularFormula?.trim();
  const title = (property?.Title ?? property?.IUPACName)?.trim();
  const molarMass = Number(property?.MolecularWeight);
  if (!property || property.CID !== cid || !formula || !title || !Number.isFinite(molarMass) || molarMass <= 0) {
    return NextResponse.json({ error: 'PubChem returned incomplete material data.' }, { status: 502 });
  }

  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' };
  const cacheResponse = await fetch(`${url}/rest/v1/rpc/cache_pubchem_material`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      p_cid: cid,
      p_title: title,
      p_formula: formula,
      p_molar_mass: molarMass,
      p_iupac_name: property.IUPACName ?? null,
    }),
    cache: 'no-store',
  });
  if (!cacheResponse.ok) return NextResponse.json({ error: 'Supabase cache write failed.' }, { status: 502 });

  return NextResponse.json({
    saved: true,
    cid,
    title,
    formula,
    molarMass,
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
  });
}
