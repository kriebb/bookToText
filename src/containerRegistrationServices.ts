import 'reflect-metadata'; // Import this at the top of your entry file
import { container } from 'tsyringe';
import { ConfigLoader  } from './configLoader';
import { MessageQueue } from './messageQueue';
import { OpenAISummarizer } from './getSummaryFromOpenAI';
import { Client } from 'whatsapp-web.js';
import { WhatsAppSummaryStrategy } from './WhatsAppSummaryStrategy';
import { EmailSummaryStrategy } from './EmailSummaryStrategy';
import { MessageProcessor } from './MessageProcessor';
import { Logger } from './logger';
import { initializeWhatsAppClient } from './whatsappClient';
import { EnvValidator} from './envValidator';
import { SetupEventHandlersOptions } from './eventHandlers';
import { Lock } from './Lock';
import { Program } from './program';
import { config as dotenv_config } from 'dotenv';
import { DownloadMessageHandler } from './downloadMessages';
import { MessageProcessingStrategy } from './MessageProcessingStrategy';

function configureDI() {

    // Register your dependencies
    container.registerInstance(Client,  initializeWhatsAppClient(container.resolve(Logger)));
    container.registerInstance(SetupEventHandlersOptions, SetupEventHandlersOptionsFactory());
    container.registerSingleton(ConfigLoader);
    container.registerSingleton(Logger );
    container.registerSingleton(Lock );
    container.registerSingleton(Program);
    container.registerSingleton(EnvValidator);
    container.registerSingleton(MessageQueue);
    container.registerSingleton(WhatsAppSummaryStrategy);
    container.registerSingleton(EmailSummaryStrategy);
    container.registerSingleton(MessageProcessor);
    container.registerSingleton(DownloadMessageHandler);
    container.register(OpenAISummarizer, {
        useFactory: (d:any) => {
            const prompt = container.resolve(ConfigLoader).loadConfig('config.json').summarize_prompt;
            const promptAdapted = prompt.replace('{DIRECTOR_NAME}', d.DIRECTOR_NAME).replace('{COMPANY_NAME}', d.COMPANY_NAME);
            return new OpenAISummarizer(process.env.OPENAI_API_KEY!,promptAdapted);
        }
    });
    container.register("MessageProcessingStrategy", { 
        
        useValue:  process.env.MESSAGE_PROCESSING_STRATEGY === 'WHATSAPP' ? container.resolve(WhatsAppSummaryStrategy) : container.resolve(EmailSummaryStrategy) 
    });
    // Register other dependencies similarly...
}

export default configureDI;


const SetupEventHandlersOptionsFactory= ():SetupEventHandlersOptions => {

    dotenv_config();

    const CHAT_GROUP_NAME: string = process.env.CHAT_GROUP_NAME!;
    const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
    const EMAIL_RECEIPIANTS: string[] = process.env.EMAIL_RECEIPIANT!.split(',');
    const EMAIL_SENDER: string = process.env.EMAIL_SENDER!;
    const PHONE_NUMBERS_RECEIVERS = process.env.PHONE_NUMBERS_RECEIVERS!;
    const PHONE_NUMBER = process.env.PHONE_NUMBER!;
    const DIRECTOR_NAME: string = process.env.DIRECTOR_NAME!;
    const COMPANY_NAME: string = process.env.COMPANY_NAME!;

    return {
        CHAT_GROUP_NAME,
        OPENAI_API_KEY,
        EMAIL_RECEIPIANTS,
        EMAIL_SENDER,
        PHONE_NUMBERS_RECEIVERS,
        DIRECTOR_NAME,
        PHONE_NUMBER,
        COMPANY_NAME
    }
}