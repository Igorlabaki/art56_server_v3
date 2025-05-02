import admin from 'firebase-admin';
import serviceAccount from './eventhub-notifications-system-firebase-adminsdk-fbsvc-7b26b8b2ce.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;