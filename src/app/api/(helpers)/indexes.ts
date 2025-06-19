// import { error } from "console";
import faiss from "faiss-node";
import { console } from "inspector";

type SessionIndex = {
  index: faiss.IndexFlatL2;
  timeout: NodeJS.Timeout;
  files: string[];
  texts: string[];
};

const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour

const store = new Map<string, SessionIndex>();


export function createIndex(
  sessionId: string,
  vectors: [number[]],
  texts: string[],
  file: string
) {
  const dim = 384;
  const index = new faiss.IndexFlatL2(dim);

  // const flat = flattenVectors(vectors);

  // Now add all vectors at once
  // index.add(Array.from(flat));
  for (const vec of vectors) {
    if (vec.length !== dim) {
      throw new Error("Invalid vector shape");
    }
    index.add(vec);
  }

  const timeout = setTimeout(() => {
    store.delete(sessionId);
    console.log(`Session ${sessionId} expired`);
  }, SESSION_TTL_MS);

  store.set(sessionId, { index, timeout, files: [file], texts });
  return {
    sessionId,
    // flat
  };
}

export function addToIndex(
  sessionId: string,
  vectors: [number[]],
  file: string,
  texts: string[]
) {
  const entry = store.get(sessionId);
  if (!entry) {
    console.warn(`Session ${sessionId} not found, creating new index`);
    const res = createIndex(sessionId, vectors, texts, file);
    return res;
  }
  if (entry.files.some((text) => text === file)) {
    console.warn(`File ${file} already exists in session ${sessionId}`);
    return{error: `File ${file} already exists in current session`};
  }
  // const flat = flattenVectors(vectors);
  for (const vec of vectors) {
    if (vec.length !== 384) {
      throw new Error("Invalid vector shape");
    }
    entry.index.add(vec);
  }
  entry.texts = entry.texts ? [...entry.texts, ...texts] : texts;

  // Reset expiration timeout
  clearTimeout(entry.timeout);
  entry.timeout = setTimeout(() => {
    store.delete(sessionId);
    console.log(`Session ${sessionId} expired`);
  }, SESSION_TTL_MS);
  if (file) {
    entry.files = entry.files ? [...entry.files, file] : [file];
  }
  return{entry,files: entry.files, texts: entry.texts};
}

export function searchIndex(
  sessionId: string,
  query: number[],
  topK: number = 10
): { texts: string[] } {
  const entry = store.get(sessionId);
  if (!entry) throw new Error("Session not found");
  topK = Math.min(topK, entry.texts.length);
  const result = entry.index.search(Array.from(Float32Array.from(query)), topK);
  const indices = Array.from(result.labels);
  const distances = Array.from(result.distances);

  const matchedTexts = indices.map((idx) =>
    idx >= 0 && idx < entry.texts.length ? entry.texts[idx] : "[UNKNOWN]"
  );

  return { texts: matchedTexts };
}

export function deleteIndex(sessionId: string) {
  const entry = store.get(sessionId);
  if (entry) {
    clearTimeout(entry.timeout);
    store.delete(sessionId);
    console.log(`Session ${sessionId} deleted`);
  } else {
    console.warn(`Session ${sessionId} not found for deletion`);
  }
}

export function getIndexFiles(sessionId: string) {
  const entry = store.get(sessionId);
  return entry ? entry : store.size;
}

export function vectorPool(vectors: number[][]): number[] {
  if (!vectors || vectors.length === 0 || vectors[0].length === 0) {
    console.warn("Empty or invalid vectors passed to pooling");
    return [];
  }

  const dim = vectors[0].length;
  const pooled = new Array(dim).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      pooled[i] += vec[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    pooled[i] /= vectors.length;
  }

  return pooled;
}

export function reshapeTensor(data: Float32Array, dims: number[]): number[][] {
  const [_, tokens, dim] = dims;
  const result: number[][] = [];

  for (let i = 0; i < tokens; i++) {
    const start = i * dim;
    const end = start + dim;
    result.push(Array.from(data.slice(start, end)));
  }

  return result;
}

export function preprocessText(text: string) {
  text = text.replace(/\W+/g, " "); // Remove special characters
  text = text.replace(/\s+/g, " ").trim(); // Remove extra spaces
  return text.toLowerCase();
}
