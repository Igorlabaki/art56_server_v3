import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

export class FirebaseNotificationService {
    private static instance: FirebaseNotificationService;
    private messaging: admin.messaging.Messaging;

    private constructor() {
        const serviceAccount: ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        this.messaging = admin.messaging();
    }

    public static getInstance(): FirebaseNotificationService {
        if (!FirebaseNotificationService.instance) {
            FirebaseNotificationService.instance = new FirebaseNotificationService();
        }
        return FirebaseNotificationService.instance;
    }

    public async sendNotification(token: string, title: string, body: string): Promise<void> {
        try {
            await this.messaging.send({
                token,
                notification: {
                    title,
                    body,
                },
                data: {
                    type: 'PROPOSAL',
                },
            });
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            // Não lançamos o erro para não interromper o fluxo principal
        }
    }
} 