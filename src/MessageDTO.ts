import { ChatDTO } from "./ChatDTO";

export interface MessageDTO {
    id: string;
    content: string;
    timestamp: number;
    fromIdKnownInWA: string;
    fromGivenNameByWAUser: string | undefined;
    fromPushName:string;
    chat: ChatDTO;
}
