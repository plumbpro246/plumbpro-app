// GPS Geofencing Service for Auto Time Tracking
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import localforage from 'localforage';

const GEOFENCE_RADIUS_METERS = 100; // 100 meter radius
const LOCATION_CHECK_INTERVAL = 60000; // Check every 60 seconds
const STORAGE_KEY = 'plumbpro_geofences';
const ACTIVE_JOB_KEY = 'plumbpro_active_job';

class GeofenceService {
  constructor() {
    this.watchId = null;
    this.geofences = [];
    this.activeJob = null;
    this.isTracking = false;
    this.onJobEnter = null;
    this.onJobExit = null;
  }

  // Initialize the service
  async init(callbacks = {}) {
    this.onJobEnter = callbacks.onJobEnter;
    this.onJobExit = callbacks.onJobExit;
    
    // Load saved geofences
    const saved = await localforage.getItem(STORAGE_KEY);
    if (saved) {
      this.geofences = saved;
    }
    
    // Load active job
    const activeJob = await localforage.getItem(ACTIVE_JOB_KEY);
    if (activeJob) {
      this.activeJob = activeJob;
    }

    // Request permissions
    await this.requestPermissions();
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const status = await Geolocation.checkPermissions();
      
      if (status.location !== 'granted') {
        const result = await Geolocation.requestPermissions();
        return result.location === 'granted';
      }
      
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // Add a job site geofence
  async addJobSite(jobId, jobName, latitude, longitude) {
    const geofence = {
      id: jobId,
      name: jobName,
      latitude,
      longitude,
      radius: GEOFENCE_RADIUS_METERS,
      createdAt: new Date().toISOString()
    };
    
    // Check if already exists
    const existingIndex = this.geofences.findIndex(g => g.id === jobId);
    if (existingIndex >= 0) {
      this.geofences[existingIndex] = geofence;
    } else {
      this.geofences.push(geofence);
    }
    
    await localforage.setItem(STORAGE_KEY, this.geofences);
    return geofence;
  }

  // Remove a job site geofence
  async removeJobSite(jobId) {
    this.geofences = this.geofences.filter(g => g.id !== jobId);
    await localforage.setItem(STORAGE_KEY, this.geofences);
  }

  // Get all job sites
  getJobSites() {
    return this.geofences;
  }

  // Start location tracking
  async startTracking() {
    if (this.isTracking) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    this.isTracking = true;
    
    // Watch position
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      (position, err) => {
        if (err) {
          console.error('Location error:', err);
          return;
        }
        this.handleLocationUpdate(position);
      }
    );

    return true;
  }

  // Stop location tracking
  async stopTracking() {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.isTracking = false;
  }

  // Handle location update
  async handleLocationUpdate(position) {
    if (!position || !position.coords) return;

    const { latitude, longitude } = position.coords;
    
    // Check each geofence
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        latitude, longitude,
        geofence.latitude, geofence.longitude
      );
      
      const isInside = distance <= geofence.radius;
      
      // Check if entering job site
      if (isInside && (!this.activeJob || this.activeJob.id !== geofence.id)) {
        await this.handleJobEnter(geofence);
      }
      // Check if leaving job site
      else if (!isInside && this.activeJob && this.activeJob.id === geofence.id) {
        await this.handleJobExit(geofence);
      }
    }
  }

  // Handle entering a job site
  async handleJobEnter(geofence) {
    const startTime = new Date();
    this.activeJob = {
      id: geofence.id,
      name: geofence.name,
      startTime: startTime.toISOString(),
      startTimeFormatted: startTime.toLocaleTimeString()
    };
    
    await localforage.setItem(ACTIVE_JOB_KEY, this.activeJob);
    
    // Show notification
    await this.showNotification(
      'Arrived at Job Site',
      `Started tracking time at ${geofence.name}`,
      'job-enter'
    );
    
    // Callback
    if (this.onJobEnter) {
      this.onJobEnter(this.activeJob);
    }
  }

  // Handle leaving a job site
  async handleJobExit(geofence) {
    if (!this.activeJob) return;
    
    const endTime = new Date();
    const startTime = new Date(this.activeJob.startTime);
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    
    const completedJob = {
      ...this.activeJob,
      endTime: endTime.toISOString(),
      endTimeFormatted: endTime.toLocaleTimeString(),
      hoursWorked: Math.round(hoursWorked * 100) / 100
    };
    
    this.activeJob = null;
    await localforage.removeItem(ACTIVE_JOB_KEY);
    
    // Show notification
    await this.showNotification(
      'Left Job Site',
      `Worked ${completedJob.hoursWorked.toFixed(2)} hours at ${geofence.name}`,
      'job-exit'
    );
    
    // Callback
    if (this.onJobExit) {
      this.onJobExit(completedJob);
    }
    
    return completedJob;
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Show notification
  async showNotification(title, body, tag) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date() },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          largeIcon: 'ic_launcher',
          channelId: 'plumbpro-geofence'
        }]
      });
    } catch (error) {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, tag });
      }
    }
  }

  // Get active job status
  getActiveJob() {
    return this.activeJob;
  }

  // Manual clock in at current location
  async clockInAtCurrentLocation(jobName) {
    const location = await this.getCurrentLocation();
    
    // Add as temporary geofence
    const jobId = `manual-${Date.now()}`;
    await this.addJobSite(jobId, jobName, location.latitude, location.longitude);
    
    // Trigger job enter
    await this.handleJobEnter({
      id: jobId,
      name: jobName,
      latitude: location.latitude,
      longitude: location.longitude
    });
    
    return this.activeJob;
  }

  // Manual clock out
  async clockOut() {
    if (!this.activeJob) return null;
    
    const geofence = this.geofences.find(g => g.id === this.activeJob.id);
    if (geofence) {
      return await this.handleJobExit(geofence);
    }
    
    return null;
  }
}

// Create singleton instance
const geofenceService = new GeofenceService();

export default geofenceService;
export { GeofenceService };
