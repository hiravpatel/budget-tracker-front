import { getQueuedRequests, removeQueuedRequest } from './offlineQueue';
import axiosInstance from '../api/axios';

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data === 'sync' || event.data.type === 'SYNC') {
          await syncQueuedRequests();
        }
      });

      // Also listen to online event
      window.addEventListener('online', syncQueuedRequests);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const syncQueuedRequests = async () => {
  const requests = await getQueuedRequests();
  if (requests.length === 0) return;

  console.log(`Syncing ${requests.length} offline requests...`);

  for (const req of requests) {
    try {
      await axiosInstance({
        url: req.url,
        method: req.method,
        data: req.body,
        headers: req.headers
      });
      // If success, remove from queue
      await removeQueuedRequest(req.id);
    } catch (error: any) {
      console.error(`Failed to sync request ${req.id}`, error);
      // If it's a 4xx error (validation, etc.), maybe we should drop it to avoid infinite loop
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        await removeQueuedRequest(req.id);
      }
    }
  }
};
