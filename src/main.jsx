// File: index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Register periodic sync for background sync
        if ('periodicSync' in registration) {
          const syncTasks = async () => {
            try {
              await registration.periodicSync.register('sync-tasks', {
                minInterval: 60 * 60 * 1000 // Once per hour
              });
              
              await registration.periodicSync.register('sync-ical', {
                minInterval: 3 * 60 * 60 * 1000 // Every 3 hours
              });
            } catch (error) {
              console.error('Periodic Sync could not be registered:', error);
            }
          };
          
          syncTasks();
        }
        
        // Subscribe to push notifications
        if ('PushManager' in window) {
          const subscribeToPush = async () => {
            try {
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
                )
              });
              
              // Send subscription to server (in a real app)
              console.log('Push notification subscription:', subscription);
            } catch (error) {
              console.error('Could not subscribe to push:', error);
            }
          };
          
          // Ask for permission and subscribe (should be triggered by user action in production)
          if (Notification.permission === 'granted') {
            subscribeToPush();
          }
        }
      })
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}

// Function to convert base64 to Uint8Array for push notification
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// DataManager for local storage and IndexedDB
class DataManager {
  static DB_NAME = 'marty-ai-db';
  static DB_VERSION = 1;
  static STORES = {
    VILLAS: 'villas',
    RESERVATIONS: 'reservations',
    TASKS: 'tasks',
    TELEGRAM: 'telegram',
    SETTINGS: 'settings'
  };
  
  static async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(this.STORES.VILLAS)) {
          db.createObjectStore(this.STORES.VILLAS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.RESERVATIONS)) {
          db.createObjectStore(this.STORES.RESERVATIONS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.TASKS)) {
          db.createObjectStore(this.STORES.TASKS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.TELEGRAM)) {
          db.createObjectStore(this.STORES.TELEGRAM, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.SETTINGS)) {
          db.createObjectStore(this.STORES.SETTINGS, { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  
  static async getAll(storeName) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  static async add(storeName, item) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  static async update(storeName, item) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  static async delete(storeName, id) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  static async get(storeName, id) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  static async clearAll(storeName) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Helper methods for settings
  static async getSetting(key, defaultValue = null) {
    try {
      const value = await this.get(this.STORES.SETTINGS, key);
      return value ? value.value : defaultValue;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }
  
  static async setSetting(key, value) {
    try {
      return await this.update(this.STORES.SETTINGS, { key, value });
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return null;
    }
  }
  
  // Export data as JSON
  static async exportData() {
    try {
      const villas = await this.getAll(this.STORES.VILLAS);
      const reservations = await this.getAll(this.STORES.RESERVATIONS);
      const tasks = await this.getAll(this.STORES.TASKS);
      const settings = await this.getAll(this.STORES.SETTINGS);
      
      const data = {
        villas,
        reservations,
        tasks,
        settings
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
  
  // Import data from JSON
  static async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.clearAll(this.STORES.VILLAS);
      await this.clearAll(this.STORES.RESERVATIONS);
      await this.clearAll(this.STORES.TASKS);
      await this.clearAll(this.STORES.SETTINGS);
      
      // Import new data
      for (const villa of data.villas || []) {
        await this.add(this.STORES.VILLAS, villa);
      }
      
      for (const reservation of data.reservations || []) {
        await this.add(this.STORES.RESERVATIONS, reservation);
      }
      
      for (const task of data.tasks || []) {
        await this.add(this.STORES.TASKS, task);
      }
      
      for (const setting of data.settings || []) {
        await this.add(this.STORES.SETTINGS, setting);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Store initial data in IndexedDB
async function initializeAppData() {
  try {
    // Check if app is initialized
    const initialized = await DataManager.getSetting('initialized');
    
    if (!initialized) {
      // Initialize with sample data
      const initialVillas = [
        { id: 1, name: 'Českomalínská', reservations: 12, occupancy: 78, status: 'Obsazeno', color: '#4f46e5' },
        { id: 2, name: 'Podolí', reservations: 8, occupancy: 65, status: 'Check-out dnes', color: '#10b981' },
        { id: 3, name: 'Marna', reservations: 5, occupancy: 42, status: 'Neobsazeno', color: '#f59e0b' }
      ];
      
      for (const villa of initialVillas) {
        await DataManager.add(DataManager.STORES.VILLAS, villa);
      }
      
      // Mark as initialized
      await DataManager.setSetting('initialized', true);
      console.log('App data initialized');
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
}

// Initialize app data
initializeAppData();

// Mount React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);