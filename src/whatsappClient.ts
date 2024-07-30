import { Client, LocalAuth } from "whatsapp-web.js";
import fs from 'fs';
import { Logger } from "./logger";
export function initializeWhatsAppClient(logger:Logger): Client {

    if(!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { });
    }

    logger.info('Creating a new WhatsApp client...');
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: "./data"}),
        restartOnAuthFail: true,
        puppeteer: { headless: true }
    });
    client.initialize();
    logger.info('WhatsApp client initialized.');
    return client;
}