import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupAmount, setGroupAmount] = useState('');
    const [group, setGroup] = useState([]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
    const code = generateJoinCode()
    console.log("Create Group:", { groupTitle, groupAmount });
    const {error } = await supabase
    .from('groups')
    .insert([{ host_id: user.id, title: groupTitle, amount_per_cycle: groupAmount, join_code:code  }])
    .select()
    if (error) alert(error.message) // Returns the newly created row
   
    setIsModalOpen(false);
    setGroupTitle('');
    setGroupAmount('');
  };

  

   useEffect(() => {
    // 1. Set up the subscription
    const channel = supabase
      .channel('chanel1') // Name this anything
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          console.log('Change received!', payload);
          setGroup((prev) => [...prev, payload.new])
          
        }
      )
      .subscribe();
// 3. Cleanup: Stop listening when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user) fetchGroup();
  }, [user]);

  const fetchGroup = async() =>{
    if (!user) return;
    const { data, error } = await supabase
    .from('groups')
    .select("*")
    .eq('host_id',user.id)
      if (error) {
        return;
    }
     setGroup(data)
  }

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Stat Card 1 */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between shadow-sm h-48">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
                  <h3 className="text-3xl font-bold mt-2">$0.00</h3>
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
  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
    <h3 className="font-semibold text-lg">Your Groups</h3>
  </div>

  {group.length > 0 ? (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {group.map((g) => (
        <div key={g.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-blue-500">{g.title}</p>
              <p className="text-sm text-gray-500">Join Code: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{g.join_code}</span></p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${g.amount_per_cycle}</p>
              <p className="text-xs text-gray-500">per cycle</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      <p>No groups found. Create one to get started!</p>
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
                    <span className="text-gray-500 dark:text-gray-400">$</span>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}