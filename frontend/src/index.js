import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
        
        // Listen for SW messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SYNC_REQUESTED') {
            // Trigger sync when connection restored
            window.dispatchEvent(new CustomEvent('plumbpro-sync-requested'));
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// Initialize Capacitor plugins when running as native app
const initCapacitor = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    
    if (Capacitor.isNativePlatform()) {
      console.log('Running as native app');
      
      // Initialize local notifications channel for Android
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.createChannel({
        id: 'plumbpro-geofence',
        name: 'Job Site Tracking',
        description: 'Notifications for arriving and leaving job sites',
        importance: 4,
        visibility: 1,
        sound: 'default',
        vibration: true
      });
      
      await LocalNotifications.createChannel({
        id: 'plumbpro-reminders',
        name: 'Reminders',
        description: 'Calendar and safety talk reminders',
        importance: 3,
        visibility: 1,
        sound: 'default'
      });
    }
  } catch (error) {
    console.log('Capacitor not available:', error);
  }
};

initCapacitor();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
