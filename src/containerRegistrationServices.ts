import 'reflect-metadata'; // Import this at the top of your entry file
import { container } from 'tsyringe';
import { ConfigLoader  } from './configLoader';
import { Logger } from './logger';
import { EnvValidator} from './envValidator';
import { Program } from './program';
import { config as dotenv_config } from 'dotenv';
import { ApplicationOptions } from './ApplicationOptions';

function configureDI() {

    // Register your dependencies
    container.registerSingleton(ConfigLoader);
    container.registerSingleton(Logger );
    container.registerSingleton(Program);
    container.registerSingleton(EnvValidator);
    container.registerInstance(ApplicationOptions,  SetupEventHandlersOptionsFactory());

    // Register other dependencies similarly...
}

export default configureDI;


const SetupEventHandlersOptionsFactory= ():ApplicationOptions => {

    dotenv_config();

    const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;

    return {
        OPENAI_API_KEY,

    }
}

