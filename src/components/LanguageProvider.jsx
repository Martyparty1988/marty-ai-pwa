import React, { useState, useEffect, useContext } from 'react';
import { Globe } from 'lucide-react';

// Language translation object
const translations = {
  cs: {
    dashboard: 'Přehled',
    reservations: 'Rezervace',
    tasks: 'Úkoly',
    telegram: 'Telegram',
    settings: 'Nastavení',
    logout: 'Odhlásit se',
    today: 'Dnes',
    villas: 'Vily',
    activeReservations: 'Aktivní rezervace',
    todayCheckInOut: 'Dnešní check-in/out',
    unfinishedTasks: 'Nedokončené úkoly',
    occupied: 'Obsazeno',
    checkoutToday: 'Check-out dnes',
    vacant: 'Neobsazeno',
    todayTasks: 'Dnešní úkoly',
    noTasks: 'Žádné úkoly na dnes',
    lastMessages: 'Poslední zprávy',
    all: 'Vše',
    active: 'Aktivní',
    completed: 'Dokončené',
    priority: {
      high: 'Vysoká',
      medium: 'Normální',
      low: 'Nízká'
    },
    notes: 'Poznámky',
    addNote: 'Přidat',
    noNotes: 'Žádné poznámky',
    save: 'Uložit',
    cancel: 'Zrušit',
    edit: 'Upravit',
    delete: 'Smazat',
    pin: 'Připnout',
    unpin: 'Odepnout',
    online: 'Online',
    offline: 'Offline',
    appearance: 'Vzhled',
    darkMode: 'Tmavý režim',
    language: 'Jazyk',
    notifications: 'Notifikace',
    pushNotifications: 'Push notifikace',
    newReservationsAlert: 'Upozornění při nových rezervacích',
    calendarSync: 'Synchronizace kalendářů',
    data: 'Data',
    exportData: 'Export dat (JSON)',
    deleteData: 'Smazat data',
    messagePlaceholder: 'Napište zprávu...',
    send: 'Odeslat',
    selectVilla: 'Vyberte vilu',
    guestName: 'Jméno hosta',
    email: 'Email',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    people: 'Počet osob',
    notesField: 'Poznámky',
    create: 'Vytvořit',
    update: 'Aktualizovat',
    taskName: 'Název úkolu',
    description: 'Popis',
    villa: 'Vila',
    date: 'Datum',
    weekdays: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
    months: [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ]
  },
  en: {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    tasks: 'Tasks',
    telegram: 'Telegram',
    settings: 'Settings',
    logout: 'Logout',
    today: 'Today',
    villas: 'Villas',
    activeReservations: 'Active Reservations',
    todayCheckInOut: 'Today\'s Check-in/out',
    unfinishedTasks: 'Unfinished Tasks',
    occupied: 'Occupied',
    checkoutToday: 'Check-out today',
    vacant: 'Vacant',
    todayTasks: 'Today\'s Tasks',
    noTasks: 'No tasks for today',
    lastMessages: 'Latest Messages',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    priority: {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    notes: 'Notes',
    addNote: 'Add',
    noNotes: 'No notes',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    pin: 'Pin',
    unpin: 'Unpin',
    online: 'Online',
    offline: 'Offline',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    newReservationsAlert: 'Alert on new reservations',
    calendarSync: 'Calendar Synchronization',
    data: 'Data',
    exportData: 'Export Data (JSON)',
    deleteData: 'Delete Data',
    messagePlaceholder: 'Type a message...',
    send: 'Send',
    selectVilla: 'Select villa',
    guestName: 'Guest name',
    email: 'Email',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    people: 'Number of people',
    notesField: 'Notes',
    create: 'Create',
    update: 'Update',
    taskName: 'Task name',
    description: 'Description',
    villa: 'Villa',
    date: 'Date',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  }
};

// Language context and provider
export const LanguageContext = React.createContext({
  language: 'cs',
  t: (key) => key,
  changeLanguage: () => {}
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem('marty-ai-language') || 'cs'
  );
  
  useEffect(() => {
    localStorage.setItem('marty-ai-language', language);
  }, [language]);
  
  // Translation function that handles nested keys (e.g., 'priority.high')
  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      translation = translation[k];
    }
    
    return translation;
  };
  
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    } else {
      console.warn(`Language not supported: ${lang}`);
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language switcher component
export function LanguageSwitcher() {
  const { language, changeLanguage } = useContext(LanguageContext);
  
  return (
    <div className="flex items-center space-x-2">
      <Globe size={18} className="text-gray-500 dark:text-gray-400" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border p-1 rounded text-sm dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="cs">Čeština</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

// Examples of using the translation function:
// 
// import { useContext } from 'react';
// import { LanguageContext } from './path/to/LanguageProvider';
// 
// function MyComponent() {
//   const { t } = useContext(LanguageContext);
//   
//   return (
//     <div>
//       <h1>{t('dashboard')}</h1>
//       <p>{t('priority.high')}</p>
//     </div>
//   );
// }