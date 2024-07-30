import { MessageQueue } from './messageQueue';
import { sendEmail } from './sendEmail';
import { MessageDTO } from './MessageDTO';
import { EmailDTO } from './EmailDTO';
import { MessageProcessingStrategy } from './MessageProcessingStrategy';
import { OpenAISummarizer } from './getSummaryFromOpenAI';

export class EmailSummaryStrategyOptions
{
    EMAIL_RECEIPIANTS!: string[];
    EMAIL_SENDER!: string;

}
export class EmailSummaryStrategy implements MessageProcessingStrategy {
    constructor( private openApiSummarizer: OpenAISummarizer, private options: EmailSummaryStrategyOptions) 
    {
        if(openApiSummarizer == null) throw new Error("openApiSummarizer cannot be null");
    }
        async processMessages(messages: MessageDTO[]): Promise<void> {
        if (messages.length > 0) {



            // Send messagesToSummarize to OpenAI API and get a summary
            // This is a placeholder, replace with actual API call
            const summary = await this.openApiSummarizer.getSummary(messages);

            const email: EmailDTO = {
                to: this.options.EMAIL_RECEIPIANTS, // Add the email address to send the summary to
                from: this.options.EMAIL_SENDER, // Add the email address to send the summary from
                subject: 'Summary of messages from chat group',
                body: summary
            };

            // Send the summary as an email
            // This is a placeholder, replace with actual email sending function
            await sendEmail(email);
        }
    }
}
