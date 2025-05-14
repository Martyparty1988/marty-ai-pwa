import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Modal component for reservation details and other modal content
export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Close on escape key
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl animate-fade-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-medium">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Zavřít"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Reservation Form Component - used within modal
export function ReservationForm({ initialData, onSubmit, villas }) {
  const [formData, setFormData] = useState(initialData || {
    id: Date.now(),
    villaId: '',
    guestName: '',
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    people: 1,
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vila</label>
          <select 
            name="villaId"
            value={formData.villaId}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Vyberte vilu</option>
            {villas.map(villa => (
              <option key={villa.id} value={villa.id}>{villa.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Jméno hosta</label>
          <input 
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in</label>
            <input 
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Check-out</label>
            <input 
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Počet osob</label>
          <input 
            type="number"
            name="people"
            min="1"
            value={formData.people}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Poznámky</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          ></textarea>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={() => onSubmit(null)}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Zrušit
          </button>
          
          <button 
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {initialData ? 'Aktualizovat' : 'Vytvořit'}
          </button>
        </div>
      </div>
    </form>
  );
}

// Task Form Component - used within modal
export function TaskForm({ initialData, onSubmit, villas }) {
  const [formData, setFormData] = useState(initialData || {
    id: Date.now(),
    title: '',
    description: '',
    villa: '',
    priority: 'medium',
    date: '',
    completed: false
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Název úkolu</label>
          <input 
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Popis</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Vila</label>
          <select 
            name="villa"
            value={formData.villa}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Vyberte vilu</option>
            {villas.map(villa => (
              <option key={villa.id} value={villa.name}>{villa.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Priorita</label>
          <select 
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="high">Vysoká</option>
            <option value="medium">Normální</option>
            <option value="low">Nízká</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Datum</label>
          <input 
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={() => onSubmit(null)}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Zrušit
          </button>
          
          <button 
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {initialData ? 'Aktualizovat' : 'Vytvořit'}
          </button>
        </div>
      </div>
    </form>
  );
}