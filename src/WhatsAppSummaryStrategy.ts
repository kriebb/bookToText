import { OpenAISummarizer } from './getSummaryFromOpenAI';
import { MessageDTO } from './MessageDTO';
import { delay } from './delay';
import { MessageProcessingStrategy, SummaryStrategyOptions } from './MessageProcessingStrategy';
import { Client } from 'whatsapp-web.js';
import { injectable } from 'tsyringe';
import fs from 'fs';

@injectable()

export class WhatsAppSummaryStrategyOptions extends SummaryStrategyOptions
{
    PHONE_NUMBERS_RECEIVERS!: string;

}
@injectable()

export class WhatsAppSummaryStrategy implements MessageProcessingStrategy {

    constructor(private client: Client, private openApiSummarizer: OpenAISummarizer ) { 
        if(client == null)
            throw new Error("client cannot be null");
        if(openApiSummarizer == null)
            throw new Error("openApiSummarizer cannot be null");
    }

    async processMessages(messages: MessageDTO[],  options: WhatsAppSummaryStrategyOptions): Promise<void> {
        let summary = "";
        if(fs.existsSync('./data/summary.txt'))
            {
                summary = fs.readFileSync('./data/summary.txt', 'utf8');
                fs.unlinkSync('./data/summary.txt');
            }
            else
            {
        summary = await this.openApiSummarizer.getSummary(messages);
        fs.writeFileSync('./data/summary.txt', summary);

            }
        // Introduce a delay to mimic human behavior
        // Assuming delay is a function that takes milliseconds as an argument
        // and summary is a string containing the summary to be sent
        // Calculate the total delay based on the length of the summary
        const baseDelay = 1000; // Base delay of 1 second
        const variableDelayPerCharacter = 10; // 10 ms delay per character in the summary
        const summaryLength = summary.length;
        const variableDelay = summaryLength * variableDelayPerCharacter;

        // Introduce a random factor between 500 ms and 1500 ms
        const randomFactor = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;

        // Total delay is the sum of base delay, variable delay, and random factor
        const totalDelay = baseDelay + variableDelay + randomFactor;

        await delay(totalDelay);

        // Send the summary to a specific WhatsApp number
        if(options.PHONE_NUMBERS_RECEIVERS == null || options.PHONE_NUMBERS_RECEIVERS == "")
            {
                throw new Error("PHONE_NUMBERS_RECEIVERS cannot be null or empty");
            }
            else
            {
                const targetNumber = options.PHONE_NUMBERS_RECEIVERS.split(","); // Replace with the target WhatsApp number
                for (const number of targetNumber) {
                    const chat = await (await this.client.getContactById(number)).getChat();
                    chat.sendMessage(`Summary:\n${summary}`);       
                    await delay(totalDelay);
                }
            }


    }


}
