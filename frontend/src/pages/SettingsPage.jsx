import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, Bell, Cloud, RefreshCw, CloudOff, CheckCircle2, 
  AlertCircle, Wifi, WifiOff, Loader2, BellRing
} from "lucide-react";
import offlineService from "@/services/offlineService";
import { 
  requestNotificationPermission, 
  getNotificationPermission,
  isNotificationSupported
} from "@/services/notificationService";
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed, sendTestPush } from "@/services/pushService";

export default function SettingsPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [settings, setSettings] = useState({
    calendar_reminders: true,
    reminder_minutes_before: 30,
    daily_safety_talk: true,
    safety_talk_time: "07:00",
    browser_notifications: false
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const loadSettings = async () => {
      const authHeaders = { Authorization: `Bearer ${token}` };
      try {
        // Load from server if online, otherwise from cache
        if (navigator.onLine) {
          const response = await axios.get(`${API}/notifications/settings`, { headers: authHeaders });
          setSettings(response.data);
          await offlineService.saveNotificationSettings(response.data);
        } else {
          const cached = await offlineService.getNotificationSettings();
          if (cached) setSettings(cached);
        }

        // Get sync status
        const syncTime = await offlineService.getLastSyncTime();
        setLastSync(syncTime);

        const pending = await offlineService.getPendingSync();
        const count = pending.notes.length + pending.timesheets.length + pending.events.length;
        setPendingCount(count);

        // Get notification permission
        setNotificationPermission(getNotificationPermission());
        
        // Check push subscription status
        const pushSub = await isPushSubscribed();
        setPushEnabled(pushSub);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  const handleSaveSettings = async () => {
    try {
      if (navigator.onLine) {
        await axios.put(
          `${API}/notifications/settings`,
          null,
          { 
            headers,
            params: settings
          }
        );
      }
      await offlineService.saveNotificationSettings(settings);
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleSyncData = async () => {
    if (!navigator.onLine) {
      toast.error("You're offline. Connect to sync data.");
      return;
    }

    setSyncing(true);
    try {
      // First, sync pending data to server
      const pending = await offlineService.getPendingSync();
      if (pending.notes.length || pending.timesheets.length || pending.events.length) {
        await axios.post(`${API}/sync/pending`, {
          pending_notes: pending.notes,
          pending_timesheets: pending.timesheets,
          pending_events: pending.events
        }, { headers });
        await offlineService.clearPendingSync();
      }

      // Then, download all data for offline use
      const response = await axios.get(`${API}/sync/data`, { headers });
      await offlineService.cacheAllData(response.data);

      setLastSync(response.data.synced_at);
      setPendingCount(0);
      toast.success("Data synced successfully");
    } catch (error) {
      toast.error("Sync failed. Try again later.");
    } finally {
      setSyncing(false);
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      setSettings({ ...settings, browser_notifications: true });
      toast.success("Notifications enabled");
    } else if (permission === 'denied') {
      toast.error("Notifications blocked. Enable in browser settings.");
    }
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(token);
        setPushEnabled(false);
        toast.success("Push notifications disabled");
      } else {
        const result = await subscribeToPush(token);
        if (result) {
          setPushEnabled(true);
          toast.success("Push notifications enabled!");
        } else {
          toast.error("Could not enable push. Allow notifications in browser settings.");
        }
      }
    } catch {
      toast.error("Failed to update push settings");
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    const sent = await sendTestPush(token);
    if (sent) toast.success("Test push sent! Check your notifications.");
    else toast.error("Failed to send test push");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#FF5F00]" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">Manage notifications and offline data</p>
      </div>

      {/* Connection Status */}
      <Card className={isOnline ? "border-green-500" : "border-amber-500"}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-500" />
            ) : (
              <WifiOff className="w-6 h-6 text-amber-500" />
            )}
            <div>
              <p className="font-bold">{isOnline ? "Online" : "Offline Mode"}</p>
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? "Connected to the internet" 
                  : "Working with cached data"
                }
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{pendingCount} pending</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Data Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Offline Data Sync
          </CardTitle>
          <CardDescription>
            Sync your data to work offline in the field
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-sm">
            <div>
              <p className="font-bold">Last Synced</p>
              <p className="text-sm text-muted-foreground">
                {lastSync 
                  ? new Date(lastSync).toLocaleString()
                  : "Never synced"
                }
              </p>
            </div>
            {lastSync && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>

          <Button
            onClick={handleSyncData}
            disabled={syncing || !isOnline}
            className="w-full h-12 bg-[#003366] hover:bg-[#003366]/90 font-bold uppercase"
            data-testid="sync-data-btn"
          >
            {syncing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Sync All Data</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Sync downloads notes, timesheets, materials, bids, and calendar events for offline access
          </p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure reminders and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Notifications Permission */}
          {isNotificationSupported() && notificationPermission !== 'granted' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
              <p className="text-sm mb-3">Enable browser notifications to receive reminders</p>
              <Button
                onClick={handleEnableNotifications}
                variant="outline"
                data-testid="enable-notifications-btn"
              >
                <Bell className="w-4 h-4 mr-2" /> Enable Notifications
              </Button>
            </div>
          )}

          {/* Calendar Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-bold flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#FF5F00]" /> Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Get alerts even when the app is closed</p>
            </div>
            <div className="flex items-center gap-2">
              {pushEnabled && (
                <Button variant="outline" size="sm" onClick={handleTestPush} data-testid="test-push-btn">
                  Test
                </Button>
              )}
              <Switch
                checked={pushEnabled}
                onCheckedChange={handleTogglePush}
                disabled={pushLoading}
                data-testid="push-notifications-toggle"
              />
            </div>
          </div>

          {/* Calendar Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-bold">Calendar Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified before scheduled events</p>
            </div>
            <Switch
              checked={settings.calendar_reminders}
              onCheckedChange={(checked) => setSettings({ ...settings, calendar_reminders: checked })}
              data-testid="calendar-reminders-toggle"
            />
          </div>

          {settings.calendar_reminders && (
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Reminder Time</Label>
              <select
                value={settings.reminder_minutes_before}
                onChange={(e) => setSettings({ ...settings, reminder_minutes_before: parseInt(e.target.value) })}
                className="w-full h-12 rounded-sm border border-input bg-background px-3"
                data-testid="reminder-time-select"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
              </select>
            </div>
          )}

          {/* Daily Safety Talk */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="font-bold">Daily Safety Talk Reminder</Label>
              <p className="text-sm text-muted-foreground">Reminder to review the daily safety talk</p>
            </div>
            <Switch
              checked={settings.daily_safety_talk}
              onCheckedChange={(checked) => setSettings({ ...settings, daily_safety_talk: checked })}
              data-testid="safety-talk-toggle"
            />
          </div>

          {settings.daily_safety_talk && (
            <div>
              <Label className="text-sm font-bold uppercase tracking-wide">Safety Talk Time</Label>
              <Input
                type="time"
                value={settings.safety_talk_time}
                onChange={(e) => setSettings({ ...settings, safety_talk_time: e.target.value })}
                className="h-12"
                data-testid="safety-talk-time"
              />
            </div>
          )}

          <Button
            onClick={handleSaveSettings}
            className="w-full h-12 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase"
            data-testid="save-settings-btn"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Name</span>
            <span className="font-bold">{user?.full_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Email</span>
            <span className="font-bold">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Company</span>
            <span className="font-bold">{user?.company || "—"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Subscription</span>
            <span className="font-bold uppercase text-[#FF5F00]">{user?.subscription_tier || "Free"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
