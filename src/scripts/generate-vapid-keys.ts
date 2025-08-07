import { WebPushService } from '../services/web-push-service';

async function generateVapidKeys() {
    try {
        console.log('�� Gerando chaves VAPID...\n');
        
        const webPushService = WebPushService.getInstance();
        const keys = webPushService.generateVapidKeys();
        
        console.log('✅ Chaves VAPID geradas com sucesso!\n');
        console.log('📋 Adicione estas chaves ao seu arquivo .env:\n');
        console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
        console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
        console.log('\n�� IMPORTANTE: Mantenha a chave privada segura e nunca a compartilhe!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar chaves VAPID:', error);
    }
}

// Executar o script
generateVapidKeys(); 