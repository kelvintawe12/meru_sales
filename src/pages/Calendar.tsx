import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaDownload, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Droppable, Draggable, DragDropContext, DropResult } from 'react-beautiful-dnd';

interface SalesEvent {
  id: number;
  title: string;
  start: string; // ISO date-time string
  end: string; // ISO date-time string
  description?: string;
  category: 'Maintenance' | 'Production' | 'Safety Drill' | 'Training';
  recurrence?: 'none' | 'daily' | 'weekly';
  location?: string; // Refinery-specific: e.g., "Refinery Unit 1"
  priority: 'Low' | 'Medium' | 'High'; // Refinery-specific: urgency
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const parseDateTime = (dateTime: string) => new Date(dateTime);
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentDate, setCurrentDate] = useState(today.getDate());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<SalesEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SalesEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    startDate: formatDate(today),
    startTime: '12:00',
    endDate: formatDate(today),
    endTime: '13:00',
    description: '',
    category: 'Maintenance' as 'Maintenance' | 'Production' | 'Safety Drill' | 'Training',
    recurrence: 'none' as 'none' | 'daily' | 'weekly',
    location: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
  });
  const [error, setError] = useState('');

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrev = () => {
    if (view === 'month') {
      if (currentMonth === 0) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      const prevDate = new Date(currentYear, currentMonth, currentDate - (view === 'week' ? 7 : 1));
      setCurrentYear(prevDate.getFullYear());
      setCurrentMonth(prevDate.getMonth());
      setCurrentDate(prevDate.getDate());
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      if (currentMonth === 11) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      const nextDate = new Date(currentYear, currentMonth, currentDate + (view === 'week' ? 7 : 1));
      setCurrentYear(nextDate.getFullYear());
      setCurrentMonth(nextDate.getMonth());
      setCurrentDate(nextDate.getDate());
    }
  };

  const openEventForm = (start: Date, end?: Date) => {
    setEventForm({
      title: '',
      startDate: formatDate(start),
      startTime: formatTime(start),
      endDate: end ? formatDate(end) : formatDate(start),
      endTime: end ? formatTime(end) : formatTime(new Date(start.getTime() + 3600000)),
      description: '',
      category: 'Maintenance',
      recurrence: 'none',
      location: '',
      priority: 'Medium',
    });
    setSelectedEvent(null);
    setShowEventForm(true);
    setError('');
  };

  const openEditEventForm = (event: SalesEvent) => {
    const start = parseDateTime(event.start);
    const end = parseDateTime(event.end);
    setEventForm({
      title: event.title,
      startDate: formatDate(start),
      startTime: formatTime(start),
      endDate: formatDate(end),
      endTime: formatTime(end),
      description: event.description || '',
      category: event.category,
      recurrence: event.recurrence || 'none',
      location: event.location || '',
      priority: event.priority,
    });
    setSelectedEvent(event);
    setShowEventForm(true);
    setError('');
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      startDate: formatDate(today),
      startTime: '12:00',
      endDate: formatDate(today),
      endTime: '13:00',
      description: '',
      category: 'Maintenance',
      recurrence: 'none',
      location: '',
      priority: 'Medium',
    });
    setError('');
  };

  const validateEvent = () => {
    if (!eventForm.title.trim()) {
      setError('Event title is required');
      return false;
    }
    const start = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    const end = new Date(`${eventForm.endDate}T${eventForm.endTime}`);
    if (start >= end) {
      setError('End time must be after start time');
      return false;
    }
    if (!eventForm.location.trim()) {
      setError('Location is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSaveEvent = () => {
    if (!validateEvent()) return;
    const start = new Date(`${eventForm.startDate}T${eventForm.startTime}`).toISOString();
    const end = new Date(`${eventForm.endDate}T${eventForm.endTime}`).toISOString();
    const newEvent: SalesEvent = {
      id: selectedEvent ? selectedEvent.id : events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title: eventForm.title,
      start,
      end,
      description: eventForm.description,
      category: eventForm.category,
      recurrence: eventForm.recurrence,
      location: eventForm.location,
      priority: eventForm.priority,
    };
    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? newEvent : e));
      toast.success('Event updated successfully!');
    } else {
      setEvents([...events, newEvent]);
      toast.success('Event created successfully!');
    }
    if (eventForm.recurrence !== 'none') {
      const recurrenceCount = eventForm.recurrence === 'daily' ? 7 : 4;
      const interval = eventForm.recurrence === 'daily' ? 1 : 7;
      for (let i = 1; i < recurrenceCount; i++) {
        const nextStart = new Date(new Date(start).getTime() + i * interval * 24 * 3600000);
        const nextEnd = new Date(new Date(end).getTime() + i * interval * 24 * 3600000);
        setEvents(prev => [...prev, {
          ...newEvent,
          id: prev.length > 0 ? Math.max(...prev.map(e => e.id)) + 1 : 1,
          start: nextStart.toISOString(),
          end: nextEnd.toISOString(),
        }]);
      }
    }
    closeEventForm();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      toast.success('Event deleted successfully!');
      closeEventForm();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const eventId = parseInt(draggableId);
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const [date, time] = destination.droppableId.split('T');
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const duration = endDate.getTime() - startDate.getTime();
    const newStart = new Date(`${date}T${time || '00:00'}`);
    const newEnd = new Date(newStart.getTime() + duration);
    setEvents(events.map(e => e.id === eventId ? {
      ...e,
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    } : e));
    toast.success('Event rescheduled successfully!');
  };

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const now = new Date();
    const timers: NodeJS.Timeout[] = [];
    events.forEach(event => {
      const eventDateTime = new Date(event.start);
      const diff = eventDateTime.getTime() - now.getTime();
      if (diff > 0 && diff < 24 * 3600000) {
        const timer = setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(`Mont Meru Refinery: ${event.title}`, {
              body: `${event.description || ''}\nLocation: ${event.location}\nPriority: ${event.priority}`,
            });
          }
        }, diff - 15 * 60000);
        timers.push(timer);
      }
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [events]);

  const handleExport = () => {
    const csvRows = [
      ['ID', 'Title', 'Start', 'End', 'Description', 'Category', 'Recurrence', 'Location', 'Priority'],
      ...events.map(e => [e.id, e.title, e.start, e.end, e.description || '', e.category, e.recurrence || 'none', e.location || '', e.priority]),
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mont_meru_refinery_events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Events exported successfully!');
  };

  const eventsForDate = (date: string) => {
    return events.filter(e => formatDate(new Date(e.start)) === date);
  };

  const renderMonthView = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="border p-2 bg-gray-100"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = eventsForDate(dateStr);
      const isToday = dateStr === formatDate(today);
      cells.push(
        <Droppable droppableId={dateStr} key={dateStr}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`border p-2 h-24 overflow-auto ${isToday ? 'bg-blue-100' : 'bg-white'} hover:bg-blue-50 cursor-pointer`}
              onClick={() => openEventForm(new Date(dateStr))}
            >
              <div className="font-semibold">{day}</div>
              <div className="text-xs mt-1">
                {dayEvents.map((event, index) => (
                  <Draggable key={event.id} draggableId={event.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`rounded px-1 py-0.5 mb-1 cursor-pointer ${
                          event.category === 'Maintenance' ? 'bg-blue-200' :
                          event.category === 'Production' ? 'bg-green-200' :
                          event.category === 'Safety Drill' ? 'bg-red-200' : 'bg-yellow-200'
                        } ${event.priority === 'High' ? 'border-l-4 border-red-600' : ''}`}
                        onClick={e => { e.stopPropagation(); openEditEventForm(event); }}
                        title={`${event.title} (${event.priority})`}
                      >
                        {event.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      );
    }
    return cells;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentYear, currentMonth, currentDate - new Date(currentYear, currentMonth, currentDate).getDay());
    const days = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 3600000));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="grid grid-cols-[50px,1fr,1fr,1fr,1fr,1fr,1fr,1fr] border">
        <div></div>
        {days.map(day => (
          <div key={formatDate(day)} className="text-center font-semibold p-2 border-b">
            {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
          </div>
        ))}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2 text-sm border-r h-16 flex items-center justify-end">
              {hour}:00
            </div>
            {days.map(day => {
              const dateStr = formatDate(day);
              const timeStr = `${String(hour).padStart(2, '0')}:00`;
              return (
                <Droppable droppableId={`${dateStr}T${timeStr}`} key={`${dateStr}T${timeStr}`}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="border-b border-r h-16 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        const dateTime = new Date(`${dateStr}T${timeStr}`);
                        openEventForm(dateTime, new Date(dateTime.getTime() + 3600000));
                      }}
                    >
                      {eventsForDate(dateStr)
                        .filter(e => new Date(e.start).getHours() === hour)
                        .map((event, index) => (
                          <Draggable key={event.id} draggableId={event.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`rounded px-1 py-0.5 m-1 text-xs ${
                                  event.category === 'Maintenance' ? 'bg-blue-200' :
                                  event.category === 'Production' ? 'bg-green-200' :
                                  event.category === 'Safety Drill' ? 'bg-red-200' : 'bg-yellow-200'
                                } ${event.priority === 'High' ? 'border-l-4 border-red-600' : ''}`}
                                onClick={e => { e.stopPropagation(); openEditEventForm(event); }}
                              >
                                {event.title}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="grid grid-cols-[50px,1fr] border">
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="text-right pr-2 text-sm border-r h-16 flex items-center justify-end">
              {hour}:00
            </div>
            <Droppable droppableId={`${dateStr}T${String(hour).padStart(2, '0')}:00`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="border-b h-16 hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    const dateTime = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00`);
                    openEventForm(dateTime, new Date(dateTime.getTime() + 3600000));
                  }}
                >
                  {eventsForDate(dateStr)
                    .filter(e => new Date(e.start).getHours() === hour)
                    .map((event, index) => (
                      <Draggable key={event.id} draggableId={event.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded px-1 py-0.5 m-1 text-xs ${
                              event.category === 'Maintenance' ? 'bg-blue-200' :
                              event.category === 'Production' ? 'bg-green-200' :
                              event.category === 'Safety Drill' ? 'bg-red-200' : 'bg-yellow-200'
                            } ${event.priority === 'High' ? 'border-l-4 border-red-600' : ''}`}
                            onClick={e => { e.stopPropagation(); openEditEventForm(event); }}
                          >
                            {event.title} ({formatTime(new Date(event.start))} - {formatTime(new Date(event.end))})
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderMiniCalendar = () => {
    const miniDaysInMonth = getDaysInMonth(currentYear, currentMonth);
    const miniFirstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const cells = [];
    for (let i = 0; i < miniFirstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    for (let day = 1; day <= miniDaysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === formatDate(today);
      cells.push(
        <div
          key={day}
          className={`h-8 w-8 flex items-center justify-center cursor-pointer rounded-full ${isToday ? 'bg-blue-800 text-white' : 'hover:bg-gray-200'}`}
          onClick={() => {
            setCurrentDate(day);
            setView('day');
          }}
        >
          {day}
        </div>
      );
    }
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between mb-2">
          <button onClick={handlePrev}><FaChevronLeft /></button>
          <span className="font-semibold">{monthNames[currentMonth]} {currentYear}</span>
          <button onClick={handleNext}><FaChevronRight /></button>
        </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => <div key={`${d}-${index}`}>{d}</div>)}
          </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        {/* Sidebar */}
        <div className="w-full sm:w-64 bg-white shadow-md p-4 flex flex-col gap-4 max-h-screen overflow-auto">
          <div className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <FaCalendarAlt className="text-gold-500" />
            Mont Meru Refinery Calendar
          </div>
          <button
            onClick={() => openEventForm(new Date())}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition"
          >
            <FaPlus /> Create Event
          </button>
          {renderMiniCalendar()}
          <div className="flex flex-col gap-2">
            {['month', 'week', 'day'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as 'month' | 'week' | 'day')}
                className={`px-4 py-2 rounded-lg text-left capitalize ${view === v ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              >
                {v} View
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="bg-gold-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gold-600 transition"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handlePrev} className="p-2 hover:bg-gray-200 rounded-full"><FaChevronLeft /></button>
                <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
                  {view === 'month' ? `${monthNames[currentMonth]} ${currentYear}` :
                    view === 'week' ? `Week of ${formatDate(new Date(currentYear, currentMonth, currentDate))}` :
                    formatDate(new Date(currentYear, currentMonth, currentDate))}
                </h1>
                <button onClick={handleNext} className="p-2 hover:bg-gray-200 rounded-full"><FaChevronRight /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['month', 'week', 'day'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v as 'month' | 'week' | 'day')}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg capitalize text-sm sm:text-base ${view === v ? 'bg-blue-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {view === 'month' && (
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-1 bg-white border rounded-lg shadow">
                <div className="col-span-full grid grid-cols-7 gap-1 text-center font-semibold text-gray-700 p-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <div key={d} className="text-xs sm:text-sm">{d}</div>
                  ))}
                </div>
                {renderMonthView()}
              </div>
            )}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </motion.div>
        </div>
        {/* Event Form Modal */}
        <AnimatePresence>
          {showEventForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
                      {selectedEvent ? 'Edit Refinery Event' : 'Create Refinery Event'}
                    </h2>
                    <button
                      onClick={closeEventForm}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={eventForm.title}
                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-800 focus:border-blue-800"
                        placeholder="e.g., Unit 1 Maintenance"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                          type="date"
                          value={eventForm.startDate}
                          onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="time"
                          value={eventForm.startTime}
                          onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                          type="date"
                          value={eventForm.endDate}
                          onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="time"
                          value={eventForm.endTime}
                          onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={eventForm.description}
                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                        placeholder="e.g., Scheduled maintenance for distillation unit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={eventForm.category}
                        onChange={e => setEventForm({ ...eventForm, category: e.target.value as 'Maintenance' | 'Production' | 'Safety Drill' | 'Training' })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Maintenance">Maintenance</option>
                        <option value="Production">Production</option>
                        <option value="Safety Drill">Safety Drill</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={eventForm.location}
                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g., Refinery Unit 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={eventForm.priority}
                        onChange={e => setEventForm({ ...eventForm, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recurrence</label>
                      <select
                        value={eventForm.recurrence}
                        onChange={e => setEventForm({ ...eventForm, recurrence: e.target.value as 'none' | 'daily' | 'weekly' })}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 sm:gap-3">
                      <button
                        onClick={handleSaveEvent}
                        className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition text-sm sm:text-base"
                      >
                        Save
                      </button>
                      <button
                        onClick={closeEventForm}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      {selectedEvent && (
                        <button
                          onClick={handleDeleteEvent}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DragDropContext>
  );
};

export default Calendar;