import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStoreTimes } from '../store/storeSlice';

export const useStoreTimes = () => {
  const dispatch = useAppDispatch();
  const { storeTimes, loading, error } = useAppSelector(
    state => state.storeTimes,
  );

  const fetchTimes = useCallback(async () => {
    try {
      await dispatch(fetchStoreTimes()).unwrap();
    } catch (error: any) {
      console.error('Failed to fetch store times:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTimes();
  }, [fetchTimes]);

  return {
    storeTimes,
    loading,
    error,
    refetch: fetchTimes,
  };
};
