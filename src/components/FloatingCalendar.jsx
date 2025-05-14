import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FloatingCalendar({ onSelectDate, selectedDate, isOpen, toggleCalendar }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localSelectedDate, setLocalSelectedDate] = useState(
    selectedDate ? new Date(selectedDate) : null
  );
  const calendarRef = useRef(null);
  
  useEffect(() => {
    if (selectedDate) {
      setLocalSelectedDate(new Date(selectedDate));
    }
  }, [selectedDate]);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        toggleCalendar(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleCalendar]);
  
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setLocalSelectedDate(newDate);
    onSelectDate(newDate.toISOString().split('T')[0]);
    toggleCalendar(false);
  };
  
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className=""></div>);
    }
    
    // Add the days of the month
    for (let i = 1; i <= days; i++) {
      const isSelected = localSelectedDate && 
        localSelectedDate.getDate() === i && 
        localSelectedDate.getMonth() === month && 
        localSelectedDate.getFullYear() === year;
      
      const isToday = new Date().getDate() === i && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;
      
      daysArray.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`p-2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''
          } ${
            isToday && !isSelected ? 'border border-indigo-600 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        >
          {i}
        </button>
      );
    }
    
    return daysArray;
  };
  
  if (!isOpen) return null;
  
  const monthNames = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 
                     'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  
  return (
    <div 
      ref={calendarRef}
      className="absolute z-20 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-3 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Předchozí měsíc"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Další měsíc"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
      
      <div className="mt-3 text-center">
        <button
          onClick={() => {
            const today = new Date();
            setLocalSelectedDate(today);
            onSelectDate(today.toISOString().split('T')[0]);
            toggleCalendar(false);
          }}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Dnes
        </button>
      </div>
    </div>
  );
}

// Date picker with floating calendar
export function DatePicker({ label, value, onChange, required }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const datePickerRef = useRef(null);
  
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };
  
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };
  
  return (
    <div className="relative" ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={formatDisplayDate(value)}
          readOnly
          onClick={toggleCalendar}
          className="w-full p-2 border rounded cursor-pointer dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="date"
          value={value || ''}
          onChange={handleInputChange}
          className="sr-only"
          required={required}
        />
        <button
          type="button"
          onClick={toggleCalendar}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          <CalendarIcon size={18} />
        </button>
      </div>
      
      <FloatingCalendar
        isOpen={isCalendarOpen}
        toggleCalendar={setIsCalendarOpen}
        selectedDate={value}
        onSelectDate={onChange}
      />
    </div>
  );
}