import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const swContent = `
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(config, null, 2)};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || "Ujuzi App \ud83c\udf93";
  const notificationOptions = {
    body: payload.notification?.body || "Una ujumbe mpya!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'firebase-messaging-sw.js'), swContent.trim());
  console.log('Successfully generated public/firebase-messaging-sw.js for Vercel deployment \u2705');
} else {
  console.warn('Warning: firebase-applet-config.json not found. Service worker not generated.');
}
