import { injectable } from "tsyringe";
import { Logger } from "./logger";
import { ApplicationOptions } from "./ApplicationOptions";

@injectable()
export class EnvValidator {
    constructor(private logger:Logger, private options: ApplicationOptions) { 
    }
    validateEnvVariables = (): void => {
        const missingVars = requiredEnvironmentVariables.filter(varName => !this.options[varName]);
        if (missingVars.length > 0) {
            throw new Error(`The following variables are missing: ${missingVars.join(', ')}`);
        } else {
            this.logger.info('All required variables are present.');
        }

        const optionalVars = Object.keys(this.options).filter(varName => !requiredEnvironmentVariables.includes(varName));
        const missingOptionalVars = optionalVars.filter(varName => !this.options[varName]);
        if (missingOptionalVars.length > 0) {
            this.logger.warn(`The following optional environment variables are missing: ${missingOptionalVars.join(', ')}`);
        }
    }
}


const requiredEnvironmentVariables = [
    'OPENAI_API_KEY',
];