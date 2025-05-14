import { useState, useEffect, useRef } from 'react';

// Improved reservations page with detailed calendar view and reservation management
export default function ReservationsPage({ villas }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  
  // Generate sample data
  useEffect(() => {
    // Simulating loading data
    setIsLoading(true);
    setTimeout(() => {
      const sampleReservations = generateSampleReservations();
      setReservations(sampleReservations);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Sample data generator
  const generateSampleReservations = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const sampleReservations = [];
    
    // Add sample reservations for the current month
    for (let i = 0; i < 15; i++) {
      const startDay = Math.floor(Math.random() * 28) + 1;
      const duration = Math.floor(Math.random() * 5) + 2;
      const villaIndex = Math.floor(Math.random() * villas.length);
      
      const checkIn = new Date(currentYear, currentMonth, startDay);
      const checkOut = new Date(currentYear, currentMonth, startDay + duration);
      
      // Skip reservations in the past
      if (checkOut < now) continue;
      
      sampleReservations.push({
        id: i + 1,
        villaId: villas[villaIndex].id,
        villaName: villas[villaIndex].name,
        villaColor: villas[villaIndex].color,
        guestName: `Host ${i + 1}`,
        guestEmail: `host${i + 1}@example.com`,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        people: Math.floor(Math.random() * 4) + 1,
        notes: Math.random() > 0.7 ? 'Poznámky k rezervaci...' : ''
      });
    }
    
    return sampleReservations;
  };
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week (0 = Monday, 6 = Sunday in our case)
  const getDayOfWeek = (date) => {
    let day = date.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, and shift other days
  };
  
  // Get the starting day of the current month view
  const getMonthStartDay = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    return getDayOfWeek(firstDay);
  };
  
  // Get the number of days in the current month
  const getDaysInCurrentMonth = () => {
    return getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  };
  
  // Generate the calendar grid for month view
  const generateCalendarGrid = () => {
    const startDay = getMonthStartDay();
    const totalDays = getDaysInCurrentMonth();
    const grid = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      grid.push({ day: null, date: null });
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      grid.push({ day, date: date.toISOString().split('T')[0] });
    }
    
    return grid;
  };
  
  // Find reservations for a specific date
  const getReservationsForDate = (dateStr) => {
    if (!dateStr) return [];
    
    return reservations.filter(reservation => {
      const checkIn = reservation.checkIn;
      const checkOut = reservation.checkOut;
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };
  
  // Handle previous month button
  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };
  
  // Handle next month button
  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };
  
  // Open create reservation modal
  const handleCreateReservation = (date) => {
    setModalType('create');
    setSelectedReservation({
      id: Date.now(),
      villaId: '',
      guestName: '',
      guestEmail: '',
      checkIn: date,
      checkOut: '',
      people: 1,
      notes: ''
    });
    setShowModal(true);
  };
  
  // Open edit reservation modal
  const handleEditReservation = (reservation) => {
    setModalType('edit');
    setSelectedReservation(reservation);
    setShowModal(true);
  };
  
  // Open view reservation modal
  const handleViewReservation = (reservation) => {
    setModalType('view');
    setSelectedReservation(reservation);
    setShowModal(true);
  };
  
  // Save reservation (create/edit)
  const handleSaveReservation = (reservation) => {
    if (modalType === 'create') {
      // Add villa name and color
      const villa = villas.find(v => v.id === parseInt(reservation.villaId));
      const newReservation = {
        ...reservation,
        villaName: villa.name,
        villaColor: villa.color
      };
      setReservations([...reservations, newReservation]);
    } else if (modalType === 'edit') {
      // Update villa name and color if changed
      let updatedReservation = { ...reservation };
      if (reservation.villaId) {
        const villa = villas.find(v => v.id === parseInt(reservation.villaId));
        updatedReservation.villaName = villa.name;
        updatedReservation.villaColor = villa.color;
      }
      
      setReservations(reservations.map(r => 
        r.id === updatedReservation.id ? updatedReservation : r
      ));
    }
    
    setShowModal(false);
  };
  
  // Delete reservation
  const handleDeleteReservation = (id) => {
    setReservations(reservations.filter(r => r.id !== id));
    setShowModal(false);
  };
  
  // Month name for display
  const getMonthName = () => {
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return months[selectedDate.getMonth()];
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Rezervace</h2>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Měsíc
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Seznam
            </button>
          </div>
          
          <button
            onClick={() => handleCreateReservation(new Date().toISOString().split('T')[0])}
            className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <span className="text-lg mr-1">+</span> Rezervace
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : viewMode === 'month' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &lt;
            </button>
            
            <h3 className="text-lg font-medium">
              {getMonthName()} {selectedDate.getFullYear()}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              &gt;
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
              <div key={day} className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarGrid().map((cell, index) => {
              const dateReservations = getReservationsForDate(cell.date);
              const isToday = cell.date === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={index}
                  className={`min-h-24 border rounded-lg ${
                    cell.day ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'
                  } ${
                    isToday ? 'border-indigo-500 dark:border-indigo-500' : ''
                  } p-1 relative`}
                >
                  {cell.day && (
                    <>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                          {cell.day}
                        </span>
                        
                        <button
                          onClick={() => handleCreateReservation(cell.date)}
                          className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                        {dateReservations.map(reservation => (
                          <div
                            key={reservation.id}
                            onClick={() => handleViewReservation(reservation)}
                            className="text-xs p-1 rounded cursor-pointer truncate"
                            style={{ 
                              backgroundColor: reservation.villaColor + '33', // Adding transparency
                              borderLeft: `3px solid ${reservation.villaColor}`
                            }}
                            title={`${reservation.villaName}: ${reservation.guestName}`}
                          >
                            {reservation.guestName}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between mb-4">
            <input
              type="month"
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            
            <button
              onClick={() => handleCreateReservation(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Nová rezervace
            </button>
          </div>
          
          {/* Filter by villa */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {villas.map(villa => (
                <div key={villa.id} className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: villa.color }}></div>
                  <span className="text-sm">{villa.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Žádné rezervace pro zobrazené období
            </div>
          ) : (
            <div className="space-y-2">
              {reservations
                .filter(res => {
                  const resMonth = new Date(res.checkIn).getMonth();
                  const resYear = new Date(res.checkIn).getFullYear();
                  return resMonth === selectedDate.getMonth() && resYear === selectedDate.getFullYear();
                })
                .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
                .map(reservation => (
                  <div
                    key={reservation.id}
                    onClick={() => handleViewReservation(reservation)}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    style={{ borderLeft: `4px solid ${reservation.villaColor}` }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{reservation.guestName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{reservation.villaName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{new Date(reservation.checkIn).toLocaleDateString('cs-CZ')} - {new Date(reservation.checkOut).toLocaleDateString('cs-CZ')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24))} dní, {reservation.people} {reservation.people === 1 ? 'osoba' : (reservation.people >= 2 && reservation.people <= 4) ? 'osoby' : 'osob'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      
      {/* Modals would be added here in a real application */}
      {/* For simplicity, I'm not including the entire modal component code here */}
      {/* It would use the Modal and ReservationForm components we defined earlier */}
    </div>
  );
}