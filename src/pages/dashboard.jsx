import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupAmount, setGroupAmount] = useState('');
  const { group, setGroup, memberGroup, setmemberGroup, fetchGroup } = useGroup();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('host');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if(!user){
     navigate('/');
  }

  
  const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const code = generateJoinCode()
      const {data: newgroup,error} = await supabase
      .from('groups')
      .insert([{ host_id: user.id, title: groupTitle, amount_per_cycle: groupAmount, join_code:code  }])
      .select()
      .single()// Returns the newly created row
      if(newgroup){
      await supabase
      .from('slots')
      .insert([{group_id: newgroup.id, user_id: user.id, role: 'manager' }])
      }
      if (error) alert(error.message) 
      setIsModalOpen(false);
      setGroupTitle('');
      setGroupAmount('');
    } finally {
      setIsCreating(false);
    }
  };


  const handleJoinGroup = async (e) => {
  e.preventDefault();
  setIsJoining(true);
  // 1. Fetch without .single() to avoid the crash

  try{
  const { data: groups, error: fetchError } = await supabase
      .from('groups')
      .select('id')
      .eq('join_code', joinCodeInput.toUpperCase()); // No .single() here

    if (fetchError) {
      console.error(fetchError);
      return;
    }

    // 2. Check if the array is empty
    if (!groups || groups.length === 0) {
      alert("Invalid Join Code. Please try again.");
      return;
    }

    const selectedGroup = groups[0]; // Take the first match

    // 3. Proceed to insert into slots
    const { error: joinError } = await supabase
      .from('slots')
      .insert([{ 
        group_id: selectedGroup.id, 
        user_id: user.id, 
        role: 'member' 
      }]);

    if (joinError) {
      alert("You are already in this group or something went wrong.");
      console.log(joinError)
    } else {
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
    }
  }finally {
    setIsJoining(false); // Stop loading no matter what
  }
  
};

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    
    // Optimistic UI update
    setGroup(prev => prev.filter(g => g.id !== groupId));

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
      
    if (error) {
      alert(error.message);
      // Optional: Refetch groups if delete failed to revert optimistic update
      fetchGroup();
    }
  };

  const displayedGroups = activeTab === 'host' 
  ? group.filter(g => g.host_id === user?.id) 
  : memberGroup;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Sidebar */}
      <Sidebar user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-600">Piggy</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-600 dark:text-gray-300">Logout</button>
        </header>

        {/* Inner Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <header>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Here is what's happening with your groups today.</p>
            </header>

            {/* Stats / Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Create Group Card */}
              <div 
                onClick={() => setIsModalOpen(true)}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all p-6 flex flex-col items-center justify-center text-center h-48"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create a Group</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start tracking expenses together</p>
              </div>

              {/* Join Group Card */}
              <div 
                onClick={() => setIsJoinModalOpen(true)}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all p-6 flex flex-col items-center justify-center text-center h-48"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enter a Code</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join an existing group</p>
              </div>

              {/* Stat Card 1 */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between shadow-sm h-48">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
                  <h3 className="text-3xl font-bold mt-2">₱0.00</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md text-xs font-semibold">+0%</span>
                  <span>from last month</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between shadow-sm h-48">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Groups</p>
                  <h3 className="text-3xl font-bold mt-2">0</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>No active groups yet</span>
                </div>
              </div>
            </div>

            {/* Recent Activity placeholder */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
  <div className="px-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h3 className="font-semibold text-lg py-5">Your Groups</h3>
    <div className="flex space-x-6">
      <button
        onClick={() => setActiveTab('host')}
        className={`py-5 border-b-2 text-sm font-medium transition-colors ${
          activeTab === 'host' 
            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        Groups You Host
      </button>
      <button
        onClick={() => setActiveTab('member')}
        className={`py-5 border-b-2 text-sm font-medium transition-colors ${
          activeTab === 'member' 
            ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        Groups You Joined
      </button>
    </div>
  </div>

  {displayedGroups.length > 0 ?(
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {displayedGroups.map((g) => (
        <div  onClick={()=> navigate('room/'+g.join_code)}  key={g.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-blue-500">{g.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">Join Code: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">{g.join_code}</span></p>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(g.join_code); }}
                  className="p-1 text-gray-400 hover:text-blue-500 focus:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all tooltip-trigger"
                  title="Copy Code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="font-semibold">₱{g.amount_per_cycle}</p>
                <p className="text-xs text-gray-500">per cycle</p>
              </div>
              {activeTab === 'host' && (
                <button 
                  onClick={() => handleDeleteGroup(g.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete Group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      <p>{activeTab === 'host' ? 'No hosted groups found. Create one to get started!' : 'You haven\'t joined any groups yet. Enter a code to join!'}</p>
    </div>
  )}
</div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Create New Group</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Title
                </label>
                <input
                  id="groupTitle"
                  type="text"
                  required
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="e.g. Miami Trip, Roommates"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="groupAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target Amount <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">₱</span>
                  </div>
                  <input
                    id="groupAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={groupAmount}
                    onChange={(e) => setGroupAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isCreating ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsJoinModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Join a Group</h3>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleJoinGroup} className="p-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="joinCodeInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Code
                </label>
                <input
                  id="joinCodeInput"
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. ABCDEF"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all uppercase"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isJoining ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Join Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}