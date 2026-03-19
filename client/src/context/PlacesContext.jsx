/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { apiRequest } from '../lib/api';

export const PlacesContext = createContext();

export function usePlaces() {
  return useContext(PlacesContext);
}

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);

  const fetchPlacesByUser = useCallback(async (uid) => {
    const data = await apiRequest(`/api/places/user/${uid}`);
    setPlaces(data.places || []);
    return data.places || [];
  }, []);

  const fetchPlaceById = useCallback(async (pid) => {
    const data = await apiRequest(`/api/places/${pid}`);
    return data.place;
  }, []);

  const addPlace = useCallback(async (placeData) => {
    const data = await apiRequest('/api/places', {
      method: 'POST',
      body: JSON.stringify(placeData),
    });
    return data.place;
  }, []);

  const updatePlace = useCallback(async (placeId, updatedFields) => {
    const data = await apiRequest(`/api/places/${placeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedFields),
    });
    setPlaces((prev) => prev.map((p) => (p.id === placeId ? data.place : p)));
    return data.place;
  }, []);

  const deletePlace = useCallback(async (placeId) => {
    await apiRequest(`/api/places/${placeId}`, {
      method: 'DELETE',
    });
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
  }, []);

  const value = useMemo(
    () => ({
      places,
      fetchPlacesByUser,
      fetchPlaceById,
      addPlace,
      updatePlace,
      deletePlace,
    }),
    [places, fetchPlacesByUser, fetchPlaceById, addPlace, updatePlace, deletePlace]
  );

  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
}
