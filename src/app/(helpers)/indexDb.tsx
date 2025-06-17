import { openDB } from "idb";

export const initDB = async () => {
  return await openDB('rag_db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: "id", autoIncrement: true });
      }
    },
  });
};