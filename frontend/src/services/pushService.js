const API = process.env.REACT_APP_BACKEND_URL + '/api';
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;
    
    const registration = await navigator.serviceWorker.ready;
    
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    
    await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subscription: subscription.toJSON() })
    });
    
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(token) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch(`${API}/push/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ endpoint })
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function isPushSubscribed() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

export async function sendTestPush(token) {
  try {
    await fetch(`${API}/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'PlumbPro',
        message: 'Push notifications are working! You\'ll get daily safety talk reminders and team updates.',
        url: '/dashboard'
      })
    });
    return true;
  } catch {
    return false;
  }
}
