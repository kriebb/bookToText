import { inject, injectable } from 'tsyringe';
import { MessageDTO } from './MessageDTO';
import { MessageProcessingStrategy, SummaryStrategyOptions } from './MessageProcessingStrategy';

@injectable()
export class MessageProcessor {

    constructor(@inject('MessageProcessingStrategy') private strategy: MessageProcessingStrategy) {
        if(strategy == null) throw new Error("Strategy cannot be null");
        this.strategy = strategy;
    }


    async processMessages<T extends SummaryStrategyOptions> (messages: MessageDTO[], options: T) {
        await this.strategy.processMessages(messages, options);
    }
}
