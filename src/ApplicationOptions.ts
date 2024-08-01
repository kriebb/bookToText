import { injectable } from "tsyringe";

@injectable()
export class ApplicationOptions {
    OPENAI_API_KEY!: string;
}
