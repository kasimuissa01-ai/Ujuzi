import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '';

// Initialize Mixpanel if token is available
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: true, // Force debug mode to see logs in console
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: true, // Ensures it works even if browser 'Do Not Track' is on
  });
  console.log('Mixpanel Initialized with token:', MIXPANEL_TOKEN.substring(0, 5) + '...');
} else {
  console.log('Mixpanel is disabled (no VITE_MIXPANEL_TOKEN provided)');
}

export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  console.log(`[Mixpanel] Tracking: ${eventName}`, props);
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, props);
  }
};

export const identifyUser = (userId: string, props?: Record<string, any>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    if (props) {
      mixpanel.people.set(props);
    }
  }
};

export const resetUser = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
};

export default mixpanel;
