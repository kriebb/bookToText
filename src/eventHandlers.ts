import { PageEmittedEvents } from 'puppeteer';
import WAWebJS, { Client, Events } from 'whatsapp-web.js';
import {Logger } from './logger';
import { scheduleJob } from 'node-schedule';
import { MessageDTO } from './MessageDTO';
import { MessageQueue } from './messageQueue';
import { Lock } from './Lock';
import { MessageProcessor } from './MessageProcessor';
import {  inject, injectable } from 'tsyringe';
import { MessageDtoMapper } from './messageDtoMapper';
import fs from 'fs';
import { DownloadMessageHandler } from './downloadMessages';
export class SetupEventHandlersOptions {
    PHONE_NUMBER!: string;
    CHAT_GROUP_NAME!: string;
    OPENAI_API_KEY!: string;
    EMAIL_RECEIPIANTS!: string[];
    EMAIL_SENDER!: string;
    PHONE_NUMBERS_RECEIVERS!: string;
    DIRECTOR_NAME!: string;
    COMPANY_NAME!: string ;
}

const EVERY_HOUR_CRON = '0 * * * *';
const DAYS = 1;
@injectable()
export class EventHandlers {


    
    constructor(
       private client: Client, private q: MessageQueue, private messageProcessor: MessageProcessor, private logger:Logger, private options: SetupEventHandlersOptions, private messageDtoMapper:MessageDtoMapper,  private processLatestMessages: DownloadMessageHandler) 
       {}

    setup = ( ): void => {
        this.registerEventHandlers();
        this.scheduleMessageProcessing(EVERY_HOUR_CRON);
    }
    private processingMessagesLock: Lock = new Lock(this.logger );
    private pairingCodeRequested: boolean = false;

    private registerEventHandlers(): void {
        this.client.on(Events.AUTHENTICATED, () => this.handleAuthenticated(this.options));
        this.client.on(Events.AUTHENTICATION_FAILURE, (msg) => this.handleAuthenticationFailure(msg,this.options));
        this.client.on(Events.DISCONNECTED, (reason) => this.handleDisconnected(reason,this.options));
        this.client.on(Events.READY, () => this.handleReady(this.options));
        this.client.on(Events.LOADING_SCREEN, (percent, message) => this.handleLoadingScreen(percent, message,this.options));
        this.client.on(Events.QR_RECEIVED, (qr) => this.handleQrReceived(qr,this.options));
        this.client.on(Events.MESSAGE_CREATE, (message) => this.handleMessageCreate(message,this.options));

        const handleError = (err: Error) => this.logger.error('Page error: ' + JSON.stringify(err.toString()));
        this.client.pupPage?.on(PageEmittedEvents.PageError, handleError);
        this.client.pupPage?.on(PageEmittedEvents.Error, handleError);
    }

    private async handleAuthenticated(options: SetupEventHandlersOptions): Promise<void> {
        this.logger.info('AUTHENTICATED');
    }

    private async handleAuthenticationFailure(msg: string, options: SetupEventHandlersOptions): Promise<void> {
        this.logger.error('AUTHENTICATION FAILURE' + msg);
    }

    private async handleDisconnected(reason: string, options: SetupEventHandlersOptions): Promise<void> {
        this.logger.error(`Client was disconnected: ${reason}`);
    }

    private async handleReady(options: SetupEventHandlersOptions): Promise<void> {
        this.logger.info('READY');
        const debugWWebVersion = await this.client.getWWebVersion();
        this.logger.info(`WWebVersion = ${debugWWebVersion}`);

        this.processLatestMessages.downloadMessages(
            { 
                dataPath: "./data/messages.json", 
            CHAT_GROUP_NAME: options.CHAT_GROUP_NAME,

            PHONE_NUMBERS_RECEIVERS: options.PHONE_NUMBERS_RECEIVERS
        });

    }

    private async handleLoadingScreen(percent: string, message: string, options: SetupEventHandlersOptions): Promise<void> {
        this.logger.info(`LOADING SCREEN: ${percent} - ${message}`);
    }

    private async handleQrReceived(qr: string, options: SetupEventHandlersOptions): Promise<void> {
        if (!this.pairingCodeRequested) {
            const pairingCode = await this.client.requestPairingCode(options.PHONE_NUMBER);
            this.logger.info('Pairing code enabled, code: ' + pairingCode);
            this.pairingCodeRequested = true;
        }
    }

    private async handleMessageCreate(message: WAWebJS.Message, options: SetupEventHandlersOptions): Promise<void> {
        try {
            const chat = await message.getChat();
            if (chat.name === options.CHAT_GROUP_NAME) {
                const contact = await this.client.getContactById(message.from);
                if (!contact) {
                    this.logger.error("Contact not found for message from: " + message.from);
                    return;
                }

                const mDto: MessageDTO = this.messageDtoMapper.map(message, chat, contact);
                this.logger.debug("Enqueuing message: " + JSON.stringify(mDto));
                this.q.enqueue(mDto);

                fs.appendFileSync("./data/queue.json", JSON.stringify(mDto));

            }
        } catch (error) {
            this.logger.error('Error handling message create:' + JSON.stringify(error));
        }
    }



    private scheduleMessageProcessing(cronExpression: string): void {
        scheduleJob(cronExpression, async () => {
            try {
                this.processingMessagesLock.acquire();
                this.logger.debug("Processing messages");
                if (this.q.length() > 0) {
                    this.logger.info('Processing messages... Current queue length: ' + this.q.length());
                    let messagesToProcess:MessageDTO[] = [];
                    if(fs.existsSync("./data/queue.json"))
                    {
                        const content = fs.readFileSync("./data/queue.json", 'utf8');
                        const messages = JSON.parse(content);
                        messagesToProcess = [ ...messagesToProcess,...this.q.messages()];
                        try {
                            fs.unlinkSync("./data/queue.json");

                        } catch (error) {
                           this.logger.error("Error deleting queue file: " + JSON.stringify(error)); 
                        }
                    }
                    else
                    {
                        messagesToProcess = [...this.q.messages()];

                    }

                    try {
                        fs.writeFileSync("./data/queue.json", JSON.stringify(messagesToProcess));
                        await this.messageProcessor.processMessages(messagesToProcess, { PHONE_NUMBERS_RECEIVERS: this.options.PHONE_NUMBERS_RECEIVERS });
                        try {
                            fs.unlinkSync("./data/queue.json");

                        } catch (error) {
                           this.logger.error("Error deleting queue file: " + JSON.stringify(error)); 
                        }
                    }
                    catch (error) {
                        this.logger.error("Error writing queue to file: " + JSON.stringify(error));
                    }


                    this.q.clear();
                }
            } finally {
                this.processingMessagesLock.release();
            }
        });
    }
}