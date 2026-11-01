import { substances, type Substance } from '@/lib/chemistry';
import { reactionDatabase, type ReactionDefinition } from '@/lib/reaction-database';

export type CatalogPayload = { materials: Substance[]; reactions: ReactionDefinition[]; source: 'supabase' };

export function mergeCatalog(payload: CatalogPayload) {
  const materials = new Map(substances.map((material) => [material.id, material]));
  payload.materials.forEach((material) => materials.set(material.id, material));
  const reactions = new Map(reactionDatabase.map((reaction) => [reaction.equation, reaction]));
  payload.reactions.forEach((reaction) => reactions.set(reaction.equation, reaction));
  return { materials: [...materials.values()], reactions: [...reactions.values()] };
}

export async function loadCatalog(signal?: AbortSignal) {
  const response = await fetch('/api/catalog', { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return mergeCatalog(await response.json() as CatalogPayload);
}
