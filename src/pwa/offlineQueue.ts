import { openDB } from 'idb';

const DB_NAME = 'smartspend-offline';
const STORE_NAME = 'sync-queue';

export const initOfflineDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const enqueueRequest = async (request: { url: string; method: string; body?: any; headers?: any }) => {
  const db = await initOfflineDB();
  await db.add(STORE_NAME, {
    ...request,
    timestamp: Date.now(),
  });
};

export const getQueuedRequests = async () => {
  const db = await initOfflineDB();
  return db.getAll(STORE_NAME);
};

export const removeQueuedRequest = async (id: number) => {
  const db = await initOfflineDB();
  await db.delete(STORE_NAME, id);
};
