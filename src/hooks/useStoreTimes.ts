import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStoreTimes, fetchStoreOverrides } from '../store/storeSlice';

export const useStoreTimes = () => {
  const dispatch = useAppDispatch();
  const { storeTimes, storeOverrides, loading, error } = useAppSelector(
    state => state.storeTimes,
  );

  const fetchTimes = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchStoreTimes()).unwrap(),
        dispatch(fetchStoreOverrides()).unwrap(),
      ]);
    } catch (error: any) {
      console.error('Failed to fetch store data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTimes();
  }, [fetchTimes]);

  return {
    storeTimes,
    storeOverrides,
    loading,
    error,
    refetch: fetchTimes,
  };
};
