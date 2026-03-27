import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'PlumbPro',
  storeName: 'plumbpro_cache',
  description: 'Offline data cache for PlumbPro Field Companion'
});

// Storage keys
const KEYS = {
  USER: 'cached_user',
  NOTES: 'cached_notes',
  TIMESHEETS: 'cached_timesheets',
  MATERIALS: 'cached_materials',
  BIDS: 'cached_bids',
  EVENTS: 'cached_events',
  PHOTOS: 'cached_photos',
  PENDING_SYNC: 'pending_sync',
  LAST_SYNC: 'last_sync',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// Check if online
export const isOnline = () => navigator.onLine;

// Cache data from server
export const cacheData = async (key, data) => {
  try {
    await localforage.setItem(key, data);
    return true;
  } catch (error) {
    console.error('Cache error:', error);
    return false;
  }
};

// Get cached data
export const getCachedData = async (key) => {
  try {
    return await localforage.getItem(key);
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

// Cache all user data for offline use
export const cacheAllData = async (syncData) => {
  try {
    await Promise.all([
      localforage.setItem(KEYS.USER, syncData.user),
      localforage.setItem(KEYS.NOTES, syncData.notes),
      localforage.setItem(KEYS.TIMESHEETS, syncData.timesheets),
      localforage.setItem(KEYS.MATERIALS, syncData.materials),
      localforage.setItem(KEYS.BIDS, syncData.bids),
      localforage.setItem(KEYS.EVENTS, syncData.events),
      localforage.setItem(KEYS.PHOTOS, syncData.photos),
      localforage.setItem(KEYS.LAST_SYNC, syncData.synced_at)
    ]);
    return true;
  } catch (error) {
    console.error('Cache all error:', error);
    return false;
  }
};

// Add item to pending sync queue
export const addToPendingSync = async (type, item) => {
  try {
    const pending = await localforage.getItem(KEYS.PENDING_SYNC) || {
      notes: [],
      timesheets: [],
      events: []
    };
    
    if (!pending[type]) {
      pending[type] = [];
    }
    
    // Check if item already exists (by id) and update or add
    const existingIndex = pending[type].findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      pending[type][existingIndex] = item;
    } else {
      pending[type].push(item);
    }
    
    await localforage.setItem(KEYS.PENDING_SYNC, pending);
    return true;
  } catch (error) {
    console.error('Add to pending sync error:', error);
    return false;
  }
};

// Get pending sync items
export const getPendingSync = async () => {
  try {
    return await localforage.getItem(KEYS.PENDING_SYNC) || {
      notes: [],
      timesheets: [],
      events: []
    };
  } catch (error) {
    console.error('Get pending sync error:', error);
    return { notes: [], timesheets: [], events: [] };
  }
};

// Clear pending sync after successful sync
export const clearPendingSync = async () => {
  try {
    await localforage.setItem(KEYS.PENDING_SYNC, {
      notes: [],
      timesheets: [],
      events: []
    });
    return true;
  } catch (error) {
    console.error('Clear pending sync error:', error);
    return false;
  }
};

// Get last sync time
export const getLastSyncTime = async () => {
  try {
    return await localforage.getItem(KEYS.LAST_SYNC);
  } catch (error) {
    return null;
  }
};

// Check if we have pending data to sync
export const hasPendingSync = async () => {
  const pending = await getPendingSync();
  return (
    pending.notes.length > 0 ||
    pending.timesheets.length > 0 ||
    pending.events.length > 0
  );
};

// Notification settings
export const getNotificationSettings = async () => {
  try {
    return await localforage.getItem(KEYS.NOTIFICATION_SETTINGS) || {
      calendar_reminders: true,
      reminder_minutes_before: 30,
      daily_safety_talk: true,
      safety_talk_time: "07:00",
      browser_notifications: false
    };
  } catch (error) {
    return null;
  }
};

export const saveNotificationSettings = async (settings) => {
  try {
    await localforage.setItem(KEYS.NOTIFICATION_SETTINGS, settings);
    return true;
  } catch (error) {
    return false;
  }
};

// Export keys for direct access
export { KEYS };

export default {
  isOnline,
  cacheData,
  getCachedData,
  cacheAllData,
  addToPendingSync,
  getPendingSync,
  clearPendingSync,
  getLastSyncTime,
  hasPendingSync,
  getNotificationSettings,
  saveNotificationSettings,
  KEYS
};
