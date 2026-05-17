import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '6cf3aaa51c63b2439e00c040e2fed861';

// Initialize Mixpanel
mixpanel.init(MIXPANEL_TOKEN, {
  debug: true, // Force debug mode to see logs in console
  track_pageview: true,
  persistence: 'localStorage',
  ignore_dnt: true, // Ensures it works even if browser 'Do Not Track' is on
});

console.log('Mixpanel Initialized with token:', MIXPANEL_TOKEN.substring(0, 5) + '...');

export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  console.log(`[Mixpanel] Tracking: ${eventName}`, props);
  mixpanel.track(eventName, props);
};

export const identifyUser = (userId: string, props?: Record<string, any>) => {
  mixpanel.identify(userId);
  if (props) {
    mixpanel.people.set(props);
  }
};

export const resetUser = () => {
  mixpanel.reset();
};

export default mixpanel;
