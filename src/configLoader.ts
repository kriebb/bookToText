import { readFileSync } from 'fs';
import { injectable } from 'tsyringe';
import { Logger } from './logger';

@injectable()
export class ConfigLoader

{
    constructor(private logger: Logger)
    {

    }
 loadConfig = (filePath: string): any => {
    this.logger.info('Loading configuration...');
    const config = JSON.parse(readFileSync(filePath, 'utf8'));
    this.logger.info('Configuration loaded.');
    return config;
 }
}