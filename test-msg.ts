import dotenv from 'dotenv';
dotenv.config();
import admin from 'firebase-admin';

const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT!;
const cert = JSON.parse(envServiceAccount);

admin.initializeApp({
  credential: admin.credential.cert(cert)
});

async function run() {
  try {
    const response = await admin.messaging().send({
      token: "dnxmcsgh_tAWP9QrJbeaO2:APA91bH7zJVybhPydEJi8PvvyrSRLV0xVkZJMvkIvtk12qUg8xqWBRTnw6UWhd8xYQ3H6G07Zb-JtKKCkXZ8wdlDT7H52v-P6MQB3I08l3cMmkMuLbR92Nc",
      notification: {
        title: "Test from Server",
        body: "This is a direct test message to your token."
      }
    });
    console.log("Success:", response);
  } catch(e) {
    console.error("Failed:", e);
  }
}
run();
