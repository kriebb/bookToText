import 'reflect-metadata'; // Import this at the top of your entry file
import { container } from 'tsyringe';
import { ConfigLoader } from './configLoader';
import { Logger } from './logger';
import { EnvValidator} from './envValidator';
import { Program } from './program';
import { config, config as dotenv_config } from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ApplicationOptions } from './ApplicationOptions';
import MarkdownIt from 'markdown-it';
import OpenAI from 'openai';
import { ClientOptions } from 'openai';
import { MarkdownProcessor } from './processors/MarkdownProcessor';
import { OpenAIProcessor } from './processors/OpenAIProcessor';
import { TesseractProcessor } from './processors/TesseractImageProcessor';
import { TextProcessor } from './processors/TextProcessor';

function configureDI() {

    // Register your dependencies
    container.registerSingleton(ConfigLoader);
    container.registerSingleton(Logger );
    container.registerSingleton(Program);
    container.registerSingleton(EnvValidator);
    container.registerSingleton(MarkdownProcessor);
    container.registerSingleton(OpenAIProcessor);
    container.registerSingleton(TesseractProcessor);
    container.registerSingleton(TextProcessor);

    container.register(ApplicationOptions, {
        useFactory: () => {
            // Load environment variables from .env file
            dotenv_config();

            // Load command-line arguments
            const argv = yargs(hideBin(process.argv)).argv as { [key: string]: unknown };

            // Load configuration from config.json
            const configLoader = container.resolve(ConfigLoader);
            const config = configLoader.loadConfig('./config.json');

            // Define final configuration with the correct priority
            const finalConfig:ApplicationOptions = new ApplicationOptions(argv, config);

            return finalConfig;
        },
    });
    
    container.registerInstance(MarkdownIt,  new MarkdownIt());
    container.register(OpenAI, {

        useFactory: () => {
            const options = container.resolve(ApplicationOptions);
            const clientOptions: ClientOptions = {
                apiKey: options.OPENAI_API_KEY,
            };
            return new OpenAI(clientOptions);
        },
    });


    // Register other dependencies similarly...
}

export default configureDI;
