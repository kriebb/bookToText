import { injectable } from "tsyringe";
import { Logger } from "./logger";

@injectable()
export class EnvValidator {
    constructor(private logger:Logger) { 
    }
     validateEnvVariables = (): void => {
        const missingVars = requiredEnvironmentVariables.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`The following environment variables are missing: ${missingVars.join(', ')}`);
        } else {
            this.logger.info('All required environment variables are present.');
        }
    }
}


const requiredEnvironmentVariables = [
    'CHAT_GROUP_NAME',
    'OPENAI_API_KEY',
    'EMAIL_RECEIPIANT',
    'EMAIL_SENDER',
    'MESSAGE_PROCESSING_STRATEGY',
    'PHONE_NUMBERS_RECEIVERS',
    'DIRECTOR_NAME',
    'COMPANY_NAME',

    'PHONE_NUMBER'
];