import { useState, useEffect } from 'react';
import { Pin, Edit, Trash, Save } from 'lucide-react';

export default function Notes({ darkMode }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('marty-ai-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('marty-ai-notes', JSON.stringify(notes));
  }, [notes]);
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote,
        createdAt: new Date().toISOString(),
        isPinned: false
      };
      
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };
  
  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    
    if (editingId === id) {
      setEditingId(null);
    }
  };
  
  const handlePinNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };
  
  const startEditing = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };
  
  const saveEdit = () => {
    if (editText.trim()) {
      setNotes(notes.map(note => 
        note.id === editingId ? { ...note, text: editText } : note
      ));
    }
    setEditingId(null);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  // Sort notes: pinned notes first, then by creation date (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Poznámky</h2>
      
      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Přidat novou poznámku..."
            className="flex-1 p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Přidat
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Žádné poznámky</p>
        ) : (
          sortedNotes.map(note => (
            <div 
              key={note.id} 
              className={`p-3 rounded-lg border ${
                note.isPinned
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 text-sm"
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center"
                    >
                      <Save size={14} className="mr-1" /> Uložit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 whitespace-pre-wrap">{note.text}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('cs-CZ')}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePinNote(note.id)}
                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          note.isPinned ? 'text-indigo-600 dark:text-indigo-400' : ''
                        }`}
                        aria-label={note.isPinned ? 'Odepnout' : 'Připnout'}
                        title={note.isPinned ? 'Odepnout' : 'Připnout'}
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Upravit"
                        title="Upravit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                        aria-label="Smazat"
                        title="Smazat"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}