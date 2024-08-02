import { readFileSync } from 'fs';
import { injectable } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { Options } from './models/Options';
import { VariableMappingService } from '../VariableMappingService';
import { SecretString } from './SecretString';
import { CONFIG_FILE_LOCATION } from './Constants';

@injectable()
export class ConfigLoader {
    options: Options | undefined;

    constructor(private logger: Logger, private variableMappingService: VariableMappingService) { }

    loadConfig(argv: any, configFilePath: string): Options {
        if (this.options == undefined) {
            this.logger.info('Loading configuration...');
            const fileContent = readFileSync(configFilePath, 'utf8');
            const config = JSON.parse(fileContent);
            const variableMapping = this.variableMappingService.buildVariableMapping();

            this.options = new Options();

            for (const [optionName, [configPath, argumentName, envVarName]] of Object.entries(variableMapping)) {
                const sources = [];
                let value = undefined;

                if (process.env[envVarName.source]) {
                    if (value && process.env[envVarName.source] != undefined || !value)
                        value = process.env[envVarName.source]!;

                    sources.push(envVarName.type);
                }


                if(configPath.source.split('.').length >= 1) {
                    const configValue = this.getNestedValue(config,configPath.source,'.');
                    if (value && configValue != undefined || !value)
                        value = configValue;

                    sources.push(CONFIG_FILE_LOCATION);
                } else
                if (config[configPath.source]) {
                    if (value && config[configPath.source] != undefined || !value)
                        value = config[configPath.source]!;


                    sources.push(CONFIG_FILE_LOCATION);
                }
                if (argv[argumentName.source]) {
                    if (value && argv[argumentName.source] != undefined || !value)
                        value = argv[argumentName.source]!;

                    sources.push(argumentName.type);
                }

                if (sources.length > 1) {
                    this.logger.debug(`Variable ${optionName} is configured from multiple sources: ${sources.join(', ')}`);
                }

                try {
                    if (this.options[optionName] instanceof SecretString) {
                        this.setValueNested(this.options, optionName, new SecretString(value), '.');
                    } else {
                        this.setValueNested(this.options, optionName, value, '.');
                    }
                } catch (error) {
                    this.logger.error(`Failed for ${optionName}: ${error}`);
                    throw error;
                }
            }

            this.logger.debug(JSON.stringify(this.options));
            this.logger.info('Configuration loaded.');
        }

        return this.options;
    }

    private setValueNested(obj: any, path: string, value: any, delim: string): void {
    
        const keys = path.split(delim);
        let current = obj;
    
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                // We are at the end, set the value
                if (current[key] !== undefined) {
                }
                current[key] = value;
            } else {
                // If the key doesn't exist, initialize it as an empty object
                if (current[key] === undefined) {
                    current[key] = {};
                }
                current = current[key];
            }
        });
    }

    private getNestedValue(obj: any, path: string, delim:string): any {
        const keys = path.split(delim);

        let current = obj;

        for (const key of keys) {
            if (current[key] === undefined) {
                return undefined;
            }
            current = current[key];
        }

        return current;
    }
}