import { injectable } from 'tsyringe';
import { EnvValidator } from './configuration/ConfigurationValidator';
import { Bootstrap as Bootstrap } from './BootStrap';
import { Logger } from './logging/Logger';

@injectable()
export class Program
{
    constructor( private envValidator: EnvValidator, private logger: Logger, private bootstrap:Bootstrap)
    {

    }
    main = async ():Promise<void> => {

        
        this.logger.info(`Running under Node.js version: ${process.version}`);


        this.envValidator.validateEnvVariables();
        return await this.bootstrap.boot( );

       
    }
}


