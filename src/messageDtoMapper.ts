import { injectable } from "tsyringe";
import WAWebJS from "whatsapp-web.js";
import { MessageDTO } from "./MessageDTO";
@injectable()
export class MessageDtoMapper
{
    public map(message: WAWebJS.Message, chat: WAWebJS.Chat, contact: WAWebJS.Contact): MessageDTO {
        return {
            id: message.id.id,
            content: message.body,
            timestamp: message.timestamp,
            fromIdKnownInWA: message.from,
            fromGivenNameByWAUser: contact.name,
            fromPushName: contact.pushname,
            chat: {
                id: chat.id._serialized,
                name: chat.name,
                isGroup: chat.isGroup,
            },
        };
    }
}