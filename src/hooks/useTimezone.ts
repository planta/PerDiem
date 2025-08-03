import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUseDeviceTimezone } from '../store/timezoneSlice';

export const useTimezone = () => {
  const dispatch = useAppDispatch();
  const { useDeviceTimezone } = useAppSelector(state => state.timezone);

  const handleSetUseDeviceTimezone = (value: boolean) => {
    dispatch(setUseDeviceTimezone(value));
  };

  return {
    useDeviceTimezone,
    setUseDeviceTimezone: handleSetUseDeviceTimezone,
  };
};
