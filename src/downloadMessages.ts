import { injectable } from "tsyringe";
import { Client } from "whatsapp-web.js";
import { Logger } from './logger';
import { MessageProcessor } from './MessageProcessor';
import { MessageDTO } from './MessageDTO';
import { MessageDtoMapper } from './messageDtoMapper';
import fs from 'fs';


const LIMIT = 1000;
@injectable()
export class DownloadMessageHandler {
    constructor(private client: Client, private logger: Logger, private messageProcessor: MessageProcessor, private messageDtoMapper: MessageDtoMapper) {

    }

    downloadMessages = async (options: {
        PHONE_NUMBERS_RECEIVERS: any; dataPath: string, CHAT_GROUP_NAME: string 
}) => {
        let mappedMessages: MessageDTO[] = [];

        if (!fs.existsSync(options.dataPath)) {
            this.logger.info('Downloading messages');
            const chats = await this.client.getChats();
            for (let chat of chats) {
                this.logger.info(`Processing chat: ${chat.name}`);
                if (options.CHAT_GROUP_NAME && chat.name === options.CHAT_GROUP_NAME) {
                    const messages = await chat.fetchMessages({ limit: LIMIT });
                    for (let message of messages) {
                        const contact = await this.client.getContactById(message.from);
                        if (!contact) {
                            this.logger.error("Contact not found for message from: " + message.from);
                            return;
                        }

                        const mappedMessage: MessageDTO = this.messageDtoMapper.map(message, chat, contact);
                        mappedMessages.push(mappedMessage);
                    }
                }

            }
            fs.writeFileSync(options.dataPath, JSON.stringify(mappedMessages));

        }
        else {
            try {
                mappedMessages = JSON.parse(fs.readFileSync(options.dataPath, 'utf8'));
            } catch (error) {
                await fs.promises.unlink(options.dataPath);
                this.logger.error('Error reading messages from file: ' + JSON.stringify(error));
                throw error;   
            }
        }
        this.logger.info(`Processing ${mappedMessages.length} messages to phone numbers: ${options.PHONE_NUMBERS_RECEIVERS}`);
        this.messageProcessor.processMessages(mappedMessages, { PHONE_NUMBERS_RECEIVERS: options.PHONE_NUMBERS_RECEIVERS });
        fs.unlinkSync(options.dataPath);

    }
}
