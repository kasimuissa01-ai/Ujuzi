import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const configPath = "/app/applet/firebase-applet-config.json";
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT!;
const cert = JSON.parse(envServiceAccount);

admin.initializeApp({
  credential: admin.credential.cert(cert)
});

async function run() {
  try {
     const db = admin.firestore();
     console.log('trying default...');
     await db.collection('users').limit(1).get();
     console.log('default worked');
  } catch(e) {
     console.error('default failed', (e as any).message);
  }
}
run();
