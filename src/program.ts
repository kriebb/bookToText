import { injectable } from 'tsyringe';
import { Bootstrap as Bootstrap } from './BootStrap';
import { Logger } from './logging/Logger';

@injectable()
export class Program
{
    constructor( private logger: Logger, private bootstrap:Bootstrap)
    {

    }
    main = async ():Promise<void> => {

        
        this.logger.info(`Running under Node.js version: ${process.version}`);


        return await this.bootstrap.boot( );

       
    }
}


