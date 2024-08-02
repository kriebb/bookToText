import { readFileSync } from 'fs';
import { injectable } from 'tsyringe';
import { Logger } from '../logging/Logger';

@injectable()
export class ConfigLoader {
   config: any | undefined;
   constructor(private logger: Logger) {

   }

   loadConfig = (filePath: string): any => {
      if (this.config == undefined) {
         this.logger.info('Loading configuration...');
         this.config = JSON.parse(readFileSync(filePath, 'utf8'));
         this.logger.info('Configuration loaded.');
      }
      return this.config;
   }
}