// App.js completo with improved implementation
import { useState, useEffect, useContext } from 'react';
import { Calendar, Menu, Home, CheckSquare, MessageCircle, Settings as SettingsIcon, Moon, Sun, BellRing, LogOut } from 'lucide-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// Import components
import Modal, { ReservationForm, TaskForm } from './components/Modal';
import FloatingCalendar, { DatePicker } from './components/FloatingCalendar';
import Notes from './components/Notes';
import { LanguageProvider, LanguageContext, LanguageSwitcher } from './components/LanguageProvider';
import ReservationsPage from './pages/ReservationsPage';

// Sample data
const initialVillas = [
  { id: 1, name: 'Českomalínská', reservations: 12, occupancy: 78, status: 'Obsazeno', color: '#4f46e5' },
  { id: 2, name: 'Podolí', reservations: 8, occupancy: 65, status: 'Check-out dnes', color: '#10b981' },
  { id: 3, name: 'Marna', reservations: 5, occupancy: 42, status: 'Neobsazeno', color: '#f59e0b' }
];

const initialTasks = [
  { id: 1, title: 'Úklid Českomalínská', villa: 'Českomalínská', priority: 'high', completed: false, date: '2025-05-14' },
  { id: 2, title: 'Kontrola topení Podolí', villa: 'Podolí', priority: 'medium', completed: false, date: '2025-05-15' },
  { id: 3, title: 'Výměna ručníků Marna', villa: 'Marna', priority: 'low', completed: true, date: '2025-05-13' }
];

const initialTelegram = [
  { id: 1, text: 'Nová rezervace v Podolí', time: '10:30', incoming: true },
  { id: 2, text: 'OK, potvrzuji', time: '10:32', incoming: false }
];

// Main App component
function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('marty-ai-theme') === 'dark' || 
    (localStorage.getItem('marty-ai-theme') === null && 
     window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [activePage, setActivePage] = useState('dashboard');
  const [villas, setVillas] = useState(initialVillas);
  const [tasks, setTasks] = useState(initialTasks);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [online, setOnline] = useState(navigator.onLine);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Check online status
  useEffect(() => {
    const handleStatusChange = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);
  
  // Persist dark mode preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('marty-ai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('marty-ai-theme', 'light');
    }
  }, [darkMode]);
  
  // Get from URL if specified
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page && ['dashboard', 'reservations', 'tasks', 'telegram', 'settings'].includes(page)) {
      setActivePage(page);
    }
  }, []);
  
  // Update URL when page changes
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('page', activePage);
    window.history.pushState({}, '', url);
  }, [activePage]);
  
  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Open modal
  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };
  
  // Add a new task
  const handleAddTask = () => {
    openModal('Nový úkol', 
      <TaskForm 
        villas={villas} 
        onSubmit={(formData) => {
          if (formData) {
            const newTask = {
              ...formData,
              id: Date.now(),
              completed: false
            };
            setTasks([...tasks, newTask]);
          }
          setShowModal(false);
        }} 
      />
    );
  };
  
  // Add a new reservation
  const handleAddReservation = () => {
    openModal('Nová rezervace', 
      <ReservationForm 
        villas={villas} 
        onSubmit={(formData) => {
          // In a real app, this would save to database/API
          setShowModal(false);
        }} 
      />
    );
  };
  
  // Edit a villa
  const handleEditVilla = (villa) => {
    // Villa edit form would be implemented here
    openModal(`Upravit ${villa.name}`, 
      <div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Název</label>
            <input 
              type="text"
              defaultValue={villa.name}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">iCal URL</label>
            <input 
              type="text"
              defaultValue={`https://example.com/ical/${villa.name.toLowerCase()}`}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Barva</label>
            <div className="flex items-center">
              <input 
                type="color"
                defaultValue={villa.color}
                className="w-10 h-10 rounded mr-2 cursor-pointer"
              />
              <input 
                type="text"
                defaultValue={villa.color}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Zrušit
            </button>
            
            <button 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Uložit
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Handle export data
  const handleExportData = () => {
    const data = {
      villas,
      tasks,
      telegram
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', `marty-ai-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
  };
  
  // Handle clear data
  const handleClearData = () => {
    openModal('Smazat data', 
      <div>
        <p className="mb-4">Opravdu chcete smazat všechna data? Tato akce je nevratná.</p>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button 
            onClick={() => setShowModal(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Zrušit
          </button>
          
          <button 
            onClick={() => {
              // Clear data
              localStorage.clear();
              setVillas(initialVillas);
              setTasks(initialTasks);
              setTelegram(initialTelegram);
              setShowModal(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Smazat
          </button>
        </div>
      </div>
    );
  };

  // Render active page content
  const renderPage = () => {
    switch(activePage) {
      case 'dashboard':
        return <Dashboard villas={villas} tasks={tasks} telegram={telegram} toggleTask={toggleTask} darkMode={darkMode} />;
      case 'reservations':
        return <ReservationsPage villas={villas} />;
      case 'tasks':
        return <Tasks tasks={tasks} toggleTask={toggleTask} villas={villas} addTask={handleAddTask} />;
      case 'telegram':
        return <Telegram messages={telegram} />;
      case 'settings':
        return (
          <Settings 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            villas={villas} 
            handleEditVilla={handleEditVilla}
            handleExportData={handleExportData}
            handleClearData={handleClearData}
          />
        );
      default:
        return <Dashboard villas={villas} tasks={tasks} telegram={telegram} toggleTask={toggleTask} darkMode={darkMode} />;
    }
  };

  return (
    <LanguageProvider>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            darkMode={darkMode}
            tasks={tasks}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Marty AI</h1>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'} text-white text-sm`}>
                  {online ? 'Online' : 'Offline'}
                </div>
                <LanguageSwitcher />
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label={darkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
            
            <TransitionGroup>
              <CSSTransition
                key={activePage}
                timeout={300}
                classNames="page-transition"
              >
                <div>
                  {renderPage()}
                </div>
              </CSSTransition>
            </TransitionGroup>
          </main>
        </div>
        
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={modalTitle}
        >
          {modalContent}
        </Modal>
      </div>
    </LanguageProvider>
  );
}

// Sidebar component
function Sidebar({ activePage, setActivePage, darkMode, tasks }) {
  const { t } = useContext(LanguageContext);
  const uncompletedTasks = tasks.filter(task => !task.completed).length;
  
  return (
    <aside className={`w-20 md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r flex flex-col`}>
      <div className="p-4 flex justify-center md:justify-start items-center">
        <div className="hidden md:block text-xl font-bold">Marty AI</div>
      </div>
      <nav className="flex-1">
        <NavItem 
          icon={<Home size={20} />} 
          label={t('dashboard')} 
          active={activePage === 'dashboard'} 
          onClick={() => setActivePage('dashboard')} 
        />
        <NavItem 
          icon={<Calendar size={20} />} 
          label={t('reservations')} 
          active={activePage === 'reservations'} 
          onClick={() => setActivePage('reservations')} 
        />
        <NavItem 
          icon={<CheckSquare size={20} />} 
          label={t('tasks')} 
          active={activePage === 'tasks'} 
          onClick={() => setActivePage('tasks')} 
          badge={uncompletedTasks}
        />
        <NavItem 
          icon={<MessageCircle size={20} />} 
          label={t('telegram')} 
          active={activePage === 'telegram'} 
          onClick={() => setActivePage('telegram')} 
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label={t('settings')} 
          active={activePage === 'settings'} 
          onClick={() => setActivePage('settings')} 
        />
      </nav>
      <div className="p-4">
        <button className="flex items-center justify-center md:justify-start w-full p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={20} className="mr-0 md:mr-2" />
          <span className="hidden md:inline">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

// Navigation item component
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full p-3 md:px-4 md:py-3 relative ${
        active 
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <div className="flex justify-center md:justify-start items-center w-full">
        <span className="mr-0 md:mr-3">{icon}</span>
        <span className="hidden md:block">{label}</span>
        {badge > 0 && (
          <span className="absolute top-2 right-2 md:relative md:top-0 md:right-0 md:ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

// Dashboard component
function Dashboard({ villas, tasks, telegram, toggleTask, darkMode }) {
  const { t } = useContext(LanguageContext);
  const todayTasks = tasks.filter(task => task.date === '2025-05-14' && !task.completed);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('villas')} value={villas.length} />
        <StatCard title={t('activeReservations')} value={villas.filter(v => v.status === 'Obsazeno').length} />
        <StatCard title={t('todayCheckInOut')} value={villas.filter(v => v.status === 'Check-out dnes').length} />
        <StatCard title={t('unfinishedTasks')} value={tasks.filter(t => !t.completed).length} />
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">{t('villas')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {villas.map(villa => (
          <VillaCard key={villa.id} villa={villa} t={t} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4">{t('todayTasks')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {todayTasks.length > 0 ? (
              <ul className="divide-y dark:divide-gray-700">
                {todayTasks.map(task => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} t={t} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noTasks')}</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">{t('lastMessages')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ul className="space-y-2">
              {telegram.slice(0, 3).map(msg => (
                <li key={msg.id} className={`p-2 rounded-lg ${
                  msg.incoming 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <div className="flex justify-between">
                    <p>{msg.text}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6">
            <Notes darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Statistic Card component
function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

// Villa Card component
function VillaCard({ villa, t }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="h-2" style={{ backgroundColor: villa.color }}></div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{villa.name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('reservations')}</p>
            <p className="font-medium">{villa.reservations}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Obsazenost</p>
            <p className="font-medium">{villa.occupancy}%</p>
          </div>
          <div className="col-span-2 mt-3">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              villa.status === 'Obsazeno' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                : villa.status === 'Check-out dnes' 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {villa.status === 'Obsazeno' ? t('occupied') : 
               villa.status === 'Check-out dnes' ? t('checkoutToday') : 
               t('vacant')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Item component
function TaskItem({ task, toggleTask, t }) {
  return (
    <li className="py-3 flex items-start">
      <button 
        onClick={() => toggleTask(task.id)}
        className={`mt-1 mr-3 h-5 w-5 rounded border flex-shrink-0 ${
          task.completed 
            ? 'bg-green-500 border-green-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        aria-checked={task.completed}
        role="checkbox"
      >
        {task.completed && <CheckSquare size={16} className="text-white" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {task.title}
          </p>
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            task.priority === 'high' 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
              : task.priority === 'medium' 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
          }`}>
            {task.priority === 'high' ? t('priority.high') : 
             task.priority === 'medium' ? t('priority.medium') : 
             t('priority.low')}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{task.villa}</p>
      </div>
    </li>
  );
}

// Tasks component
function Tasks({ tasks, toggleTask, villas, addTask }) {
  const { t } = useContext(LanguageContext);
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'completed' 
      ? tasks.filter(t => t.completed) 
      : tasks.filter(t => !t.completed);
      
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{t('tasks')}</h2>
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all' 
                  ? 'bg-white dark:bg-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('all')}
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'active' 
                  ? 'bg-white dark:bg-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('active')}
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'completed' 
                  ? 'bg-white dark:bg-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('completed')}
            </button>
          </div>
          
          <button
            onClick={addTask}
            className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <span className="text-lg mr-1">+</span> {t('tasks')}
          </button>
        </div>
      </div>
      
      <ul className="divide-y dark:divide-gray-700">
        {filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} toggleTask={toggleTask} t={t} />
        ))}
      </ul>
      
      {filteredTasks.length === 0 && (
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
          {filter === 'all' 
            ? 'Žádné úkoly' 
            : filter === 'active' 
              ? 'Žádné aktivní úkoly' 
              : 'Žádné dokončené úkoly'}
        </p>
      )}
    </div>
  );
}

// Telegram component
function Telegram({ messages }) {
  const { t } = useContext(LanguageContext);
  const [newMessage, setNewMessage] = useState('');
  
  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage('');
      // In a real app, this would send the message
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[calc(100vh-160px)] flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">{t('telegram')}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.incoming 
                ? 'bg-gray-100 dark:bg-gray-700 rounded-tl-none mr-auto' 
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-tr-none ml-auto'
            }`}
          >
            <p>{msg.text}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">{msg.time}</span>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={t('messagePlaceholder')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Settings component
function Settings({ darkMode, setDarkMode, villas, handleEditVilla, handleExportData, handleClearData }) {
  const { t, language, changeLanguage } = useContext(LanguageContext);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">{t('settings')}</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">{t('appearance')}</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span>{t('darkMode')}</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={darkMode}
            >
              <span 
                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">{t('language')}</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span>Jazyk / Language</span>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="cs">Čeština</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">{t('villas')}</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
            {villas.map(villa => (
              <div key={villa.id} className="p-4 border-b dark:border-gray-600 last:border-0 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full mr-3" style={{ backgroundColor: villa.color }}></div>
                  <span>{villa.name}</span>
                </div>
                <button 
                  onClick={() => handleEditVilla(villa)}
                  className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                >
                  {t('edit')}
                </button>
              </div>
            ))}
            <div className="p-4">
              <button className="w-full p-2 border border-dashed border-gray-300 dark:border-gray-500 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                + {t('villa')}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">{t('notifications')}</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p>{t('pushNotifications')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('newReservationsAlert')}</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
              <span className="inline-block h-4 w-4 rounded-full bg-white transform translate-x-6" />
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">{t('calendarSync')}</h3>
          <div className="space-y-3">
            {villas.map(villa => (
              <div key={villa.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium mb-2">{villa.name}</p>
                <input
                  type="text"
                  placeholder="iCal URL"
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  defaultValue={`https://example.com/ical/${villa.name.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">{t('data')}</h3>
          <div className="flex space-x-3">
            <button 
              onClick={handleExportData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              {t('exportData')}
            </button>
            <button 
              onClick={handleClearData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              {t('deleteData')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;