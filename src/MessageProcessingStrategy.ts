import { MessageDTO } from './MessageDTO';

export abstract class MessageProcessingStrategy {
    abstract processMessages(messages: MessageDTO[], options: SummaryStrategyOptions): Promise<void>;
}

export class SummaryStrategyOptions {
} 