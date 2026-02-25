import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const GroupContext = createContext();

export function useGroup() {
  return useContext(GroupContext);
}

export function GroupProvider({ children }) {
  const { user } = useAuth();
  const [group, setGroup] = useState([]);
  const [memberGroup, setmemberGroup] = useState([]);

  const fetchGroup = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('groups')
      .select('*');
    
    if (data) {
      setGroup(data);
    }
  };

  const fetchMemberGroup = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('slots')
      .select(`
        id,
        role,
        groups (
          id,
          title,
          amount_per_cycle,
          join_code,
          host_id
        )
      `)
      .eq('user_id', user.id)
      .eq('role', 'member');

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    // Flatten the data so 'groups' properties are easy to access
    const groupsOnly = data.map(item => item.groups);
    setmemberGroup(groupsOnly);
  };

  useEffect(() => {
    if (!user) {
      setGroup([]);
      setmemberGroup([]);
      return;
    }

    // Initial fetch when component loads
    fetchGroup();
    fetchMemberGroup();

    const channel = supabase
      .channel('dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slots' },
        () => {
          console.log("Member changed, refreshing...");
          fetchMemberGroup(); // Re-runs your fetch function to get full group details
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        () => {
          console.log("Group changed, refreshing...");
          fetchGroup(); // Re-runs your fetch function to get latest group info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value = {
    group,
    setGroup,
    memberGroup,
    setmemberGroup,
    fetchGroup,
    fetchMemberGroup
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}
