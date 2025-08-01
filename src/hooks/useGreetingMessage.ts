import { useState } from 'react';

export const useGreetingMessage = () => {
  const [useDeviceTimezone, setUseDeviceTimezone] = useState(false);

  const getDeviceCityName = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cityName =
        timezone.split('/').pop()?.replace('_', ' ') || 'Your City';
      return cityName;
    } catch (error) {
      return 'Your City';
    }
  };

  const getGreetingMessage = () => {
    const nyTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
    });
    const nyDate = new Date(nyTime);
    const nyHour = nyDate.getHours();

    const cityName = useDeviceTimezone ? getDeviceCityName() : 'NYC';

    if (nyHour >= 5 && nyHour < 10) {
      return `Good Morning, ${cityName}!`;
    } else if (nyHour >= 10 && nyHour < 12) {
      return `Late Morning Vibes! ${cityName}`;
    } else if (nyHour >= 12 && nyHour < 17) {
      return `Good Afternoon, ${cityName}!`;
    } else if (nyHour >= 17 && nyHour < 21) {
      return `Good Evening, ${cityName}!`;
    } else {
      return `Night Owl in ${cityName}!`;
    }
  };

  const getCurrentTimezone = () => {
    return useDeviceTimezone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'America/New_York';
  };

  const getDisplayTimezone = () => {
    return useDeviceTimezone ? getDeviceCityName() : 'New York';
  };

  return {
    greetingMessage: getGreetingMessage(),
    useDeviceTimezone,
    setUseDeviceTimezone,
    getCurrentTimezone,
    getDisplayTimezone,
  };
};
