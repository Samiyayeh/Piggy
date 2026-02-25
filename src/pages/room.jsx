import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';

const CalendarModal = ({ slot, onClose, onToggleDate, isHost, checkedDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const onDateClick = (day) => {
    if (!isHost) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onToggleDate(slot.id, dateStr);
  };

  const isChecked = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkedDates.includes(dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Tracker</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">User: {slot.email || slot.user_id.substring(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {monthNames[month]} {year}
            </h4>
            <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="p-2"></div>
            ))}
            {days.map(day => {
              const checked = isChecked(day);
              return (
                <div 
                  key={`day-${day}`} 
                  onClick={() => onDateClick(day)}
                  className={`flex items-center justify-center p-2 rounded-xl text-sm font-medium transition-all
                    ${isHost ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105' : 'cursor-default'}
                    ${checked ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <div className="relative">
                    {day}
                    {checked && (
                      <span className="absolute -top-1 -right-2">
                        <svg className="w-3 h-3 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isHost && (
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Only the group host can mark dates.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GroupRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCalendarSlot, setSelectedCalendarSlot] = useState(null);
  const [localCheckedDates, setLocalCheckedDates] = useState({});

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    // 1. Guard Clause: Don't fetch if no user or no groupId
    if (!user) {
      navigate('/');
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('groups')
          .select('*, slots(id, user_id, turn_number, role)')
          .eq('join_code', groupId)
          .maybeSingle();

        if (supabaseError) throw supabaseError;
        
        if (!data) {
          setError("Room not found");
        } else {
          setRoomData(data);
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      }
    };

    fetchRoomDetails();

    // Subscribe to realtime changes in this room
    const channel = supabase
      .channel('room-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots', filter: `group_id=eq.${roomData?.id}` }, fetchRoomDetails)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${roomData?.id}` }, fetchRoomDetails)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user, navigate, roomData?.id]);

  // Loading and Error States
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 justify-center items-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading room...</p>
        </div>
      </div>
    );
  }

  const isHost = roomData?.host_id === user.id;

  const toggleDate = async (slotId, dateStr) => {
    if (!isHost) return;

    const slot = roomData.slots.find(s => s.id === slotId);
    let currentDates = slot.checked_dates || localCheckedDates[slotId] || [];
    
    const newDates = currentDates.includes(dateStr) 
      ? currentDates.filter(d => d !== dateStr)
      : [...currentDates, dateStr];

    setLocalCheckedDates(prev => ({ ...prev, [slotId]: newDates }));

    try {
      const { error } = await supabase
        .from('slots')
        .update({ checked_dates: newDates })
        .eq('id', slotId);
      
      if (!error) {
         setRoomData(prev => ({
           ...prev,
           slots: prev.slots.map(s => s.id === slotId ? { ...s, checked_dates: newDates } : s)
         }));
      }
    } catch(err) {
      console.warn("DB update failed, using local state.", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-600">Piggy</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-600 dark:text-gray-300">Logout</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-4 group font-medium"
                >
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{roomData.title}</h1>
                  {isHost && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800/50">Host</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Group Code</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-widest bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">{groupId}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(groupId)}
                      className="p-2 text-gray-400 hover:text-blue-500 focus:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all tooltip-trigger"
                      title="Copy Code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Amount Info Card */}
              <div className="col-span-1 lg:col-span-2 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between h-full gap-6 items-start sm:items-center">
                  <div>
                    <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-2">Amount Per Cycle</h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold opacity-80">₱</span>
                      <span className="text-5xl sm:text-6xl font-black tracking-tight">{roomData.amount_per_cycle?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full sm:w-auto self-stretch flex flex-col justify-center">
                    <p className="text-sm text-blue-100 font-medium mb-1">Total Members</p>
                    <p className="text-3xl font-bold">{roomData.slots?.length || 0}</p>
                    <div className="mt-2 text-xs font-medium bg-white/20 px-2 py-1 rounded inline-block w-fit">
                      Total pool: ₱{((roomData.amount_per_cycle || 0) * (roomData.slots?.length || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>    
                </div>
              </div>

              {/* Status/Next Turn Card */}
              <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cycle Status</h3>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Next Collection In</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">Waiting for start...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 md:px-8 md:py-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Roster</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">People participating in this cycle</p>
                </div>
                {/* Future: Add member functionality here for host */}
              </div>

              {roomData.slots?.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {roomData.slots
                    .sort((a, b) => a.turn_number - b.turn_number || 0) // Sort by turn if present
                    .map((slot, index) => (
                    <div key={slot.id} className="p-6 md:px-8 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                          ${slot.user_id === user.id 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                          {/* Placeholder for User Initials - using index for now since we don't fetch profiles */}
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            User: {slot.profiles?.email || slot.user_email || slot.email || (slot.user_id === user.id ? user.email : `${slot.user_id.substring(0, 8)}...`)}
                            {slot.user_id === user.id && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">You</span>}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Active
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-gray-500 capitalize">{slot.role || 'Member'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Turn Details</p>
                          <p className="font-semibold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg mt-1 inline-block">
                            Turn {slot.turn_number || 'N/A'}
                          </p>
                        </div>
                        
                        {(isHost || slot.user_id === user.id) && (
                          <button
                            onClick={() => setSelectedCalendarSlot(slot)}
                            className="mt-2 text-xs font-semibold px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            View Calendar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No members yet</p>
                  <p className="mt-1">Share the group code to invite people.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Render Calendar Modal if a slot is selected */}
      {selectedCalendarSlot && (
        <CalendarModal 
          slot={selectedCalendarSlot} 
          onClose={() => setSelectedCalendarSlot(null)} 
          isHost={isHost}
          onToggleDate={toggleDate}
          checkedDates={selectedCalendarSlot.checked_dates || localCheckedDates[selectedCalendarSlot.id] || []}
        />
      )}
    </div>
  );
}