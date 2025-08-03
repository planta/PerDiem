import { getDeviceCityName } from '../utils/timezoneUtils';

export const useGreetingMessage = (useDeviceTimezone: boolean) => {
  const getGreetingMessage = () => {
    const now = new Date();
    const nyHour = parseInt(
      now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      }),
      10,
    );

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

  return {
    greetingMessage: getGreetingMessage(),
  };
};
