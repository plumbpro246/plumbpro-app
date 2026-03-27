// Browser Notification Service for PlumbPro

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
};

// Get current permission status
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Show a notification
export const showNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.log('Notifications not available');
    return null;
  }
  
  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'plumbpro-notification',
    requireInteraction: false,
    ...options
  };
  
  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };
    
    // Auto close after 10 seconds if not interacted
    if (!defaultOptions.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

// Show calendar reminder
export const showCalendarReminder = (event) => {
  return showNotification(`Upcoming: ${event.title}`, {
    body: `${event.date} at ${event.start_time || 'All day'}${event.description ? '\n' + event.description : ''}`,
    tag: `calendar-${event.id}`,
    requireInteraction: true,
    onClick: () => {
      window.location.href = '/calendar';
    }
  });
};

// Show safety talk reminder
export const showSafetyTalkReminder = () => {
  return showNotification('Daily Safety Talk Ready', {
    body: 'Your daily safety briefing is ready. Stay safe on the job!',
    tag: 'safety-talk-daily',
    onClick: () => {
      window.location.href = '/safety-talks';
    }
  });
};

// Show sync notification
export const showSyncNotification = (status, count = 0) => {
  const title = status === 'success' 
    ? 'Data Synced' 
    : 'Sync Failed';
  const body = status === 'success'
    ? `${count} items synced successfully`
    : 'Please try syncing again when online';
  
  return showNotification(title, {
    body,
    tag: 'sync-notification'
  });
};

// Schedule notification check (run every minute)
let notificationInterval = null;

export const startNotificationScheduler = (getEvents, getSettings) => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
  
  const checkNotifications = async () => {
    try {
      const settings = await getSettings();
      if (!settings?.calendar_reminders) return;
      
      const events = await getEvents();
      const now = new Date();
      const reminderMinutes = settings.reminder_minutes_before || 30;
      
      events.forEach(event => {
        if (!event.start_time) return;
        
        const eventDateTime = new Date(`${event.date}T${event.start_time}`);
        const diffMinutes = (eventDateTime - now) / (1000 * 60);
        
        // Show reminder if within the reminder window (±2 minutes for check interval)
        if (diffMinutes > 0 && diffMinutes <= reminderMinutes && diffMinutes > reminderMinutes - 2) {
          showCalendarReminder(event);
        }
      });
    } catch (error) {
      console.error('Notification check error:', error);
    }
  };
  
  // Check every minute
  notificationInterval = setInterval(checkNotifications, 60000);
  
  // Run initial check
  checkNotifications();
  
  return () => {
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }
  };
};

export const stopNotificationScheduler = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};

export default {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  showNotification,
  showCalendarReminder,
  showSafetyTalkReminder,
  showSyncNotification,
  startNotificationScheduler,
  stopNotificationScheduler
};
