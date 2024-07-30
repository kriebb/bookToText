import { injectable } from 'tsyringe';
import { EnvValidator } from './envValidator';
import { EventHandlers } from './eventHandlers';
import { Logger } from './logger';

@injectable()
export class Program
{
    constructor( private envValidator: EnvValidator, private logger: Logger, private eventHandlers:EventHandlers)
    {

    }
    main = () => {

        
        this.logger.info(`Running under Node.js version: ${process.version}`);


        this.envValidator.validateEnvVariables();
        this.eventHandlers.setup( );

       
    }
}


