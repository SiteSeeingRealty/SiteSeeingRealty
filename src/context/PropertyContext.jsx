import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PropertyContext = createContext();

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from('plots').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (property) => {
    const { data, error } = await supabase.from('plots').insert([property]).select();
    if (error) {
      console.error('Error adding property:', error);
      throw error;
    }
    if (data) {
      setProperties((prev) => [data[0], ...prev]);
    }
  };

  const deleteProperty = async (id) => {
    const { error } = await supabase.from('plots').delete().eq('id', id);
    if (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
    setProperties((prev) => prev.filter(p => p.id !== id));
  };

  const editProperty = async (id, updatedProperty) => {
    const { data, error } = await supabase.from('plots').update(updatedProperty).eq('id', id).select();
    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }
    if (data) {
      setProperties((prev) => prev.map(p => p.id === id ? data[0] : p));
    }
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty, deleteProperty, editProperty }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  return useContext(PropertyContext);
}
