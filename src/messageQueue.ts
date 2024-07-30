import { injectable } from 'tsyringe';
import { MessageDTO } from './MessageDTO';

// Create a queue to hold messages
@injectable()
export class MessageQueue
{
    /**
     *
     */
    constructor() {
        this.chats = [];        
    }
    public enqueue(chatDTO: MessageDTO) {
        if(this.chats == null)
            throw new Error("Queue is null");
        
       this.chats.push(chatDTO);
    }
    private chats: MessageDTO[];
    
    public clear = () =>
    {
        this.chats = [];
    }
    public messages = (): MessageDTO[] => this.chats;
    public length = (): number => this.chats.length;
}

