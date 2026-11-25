import { collection, deleteDoc, doc, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Generation, GenerationOutput, ToolId } from '../types';

/** Lit un document de l'historique, ancien format (output_data_string) compris. */
function toGeneration(id: string, data: Record<string, any>): Generation {
  let output: GenerationOutput | null = data.output_data ?? null;
  if (!output && typeof data.output_data_string === 'string') {
    try {
      output = JSON.parse(data.output_data_string);
    } catch {
      output = data.output_data_string;
    }
  }
  return {
    id,
    tool: data.tool as ToolId,
    niche: data.niche ?? '',
    platform: data.platform ?? '',
    input: data.input_data ?? null,
    output,
    createdAt: data.created_at ?? '',
  };
}

export const historyService = {
  /** Nécessite l'index composite generations(user_id ASC, created_at DESC) — voir firestore.indexes.json. */
  async list(max = 20): Promise<Generation[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, 'generations'), where('user_id', '==', uid), orderBy('created_at', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toGeneration(d.id, d.data()));
  },

  /** Nombre de scripts générés ce mois-ci (objectif : 30, une vidéo par jour). */
  async scriptsThisMonth(now = new Date()): Promise<number> {
    const uid = auth.currentUser?.uid;
    if (!uid) return 0;
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const q = query(
      collection(db, 'generations'),
      where('user_id', '==', uid),
      where('tool', '==', 'script'),
      where('created_at', '>=', start),
    );
    return (await getCountFromServer(q)).data().count;
  },

  remove: (id: string) => deleteDoc(doc(db, 'generations', id)),
};
