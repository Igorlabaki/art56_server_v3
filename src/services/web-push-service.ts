import webpush from 'web-push';

export class WebPushService {
    private static instance: WebPushService;

    private constructor() {
        // Configurar VAPID keys
        const vapidKeys = webpush.generateVAPIDKeys();
        
        webpush.setVapidDetails(
            'mailto:seu-email@exemplo.com',
            process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey,
            process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey
        );
    }

    public static getInstance(): WebPushService {
        if (!WebPushService.instance) {
            WebPushService.instance = new WebPushService();
        }
        return WebPushService.instance;
    }

    public async sendNotification(
        subscription: any,
        payload: {
            title: string;
            body: string;
            icon?: string;
            badge?: string;
            data?: any;
        }
    ): Promise<void> {
        try {
            const notificationPayload = JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: payload.icon || '/icon.png',
                badge: payload.badge || '/badge.png',
                data: payload.data || {}
            });

            await webpush.sendNotification(subscription, notificationPayload);
        } catch (error) {
            console.error('Erro ao enviar notificação Web Push:', error);
            throw error;
        }
    }

    public getVapidPublicKey(): string {
        return process.env.VAPID_PUBLIC_KEY || '';
    }

    public generateVapidKeys(): { publicKey: string; privateKey: string } {
        const vapidKeys = webpush.generateVAPIDKeys();
        return {
            publicKey: vapidKeys.publicKey,
            privateKey: vapidKeys.privateKey
        };
    }

    public async sendNotificationToMultipleSubscriptions(
        subscriptions: any[],
        payload: {
            title: string;
            body: string;
            icon?: string;
            badge?: string;
            data?: any;
        }
    ): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        const promises = subscriptions.map(async (subscription) => {
            try {
                await this.sendNotification(subscription, payload);
                success++;
            } catch (error) {
                console.error('Erro ao enviar notificação para subscription:', error);
                failed++;
                
                // Se a subscription for inválida (status 410), você pode removê-la aqui
                if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
                    console.log('Subscription inválida detectada, deve ser removida');
                }
            }
        });

        await Promise.allSettled(promises);

        return { success, failed };
    }
} 