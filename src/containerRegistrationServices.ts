import 'reflect-metadata'; // Import this at the top of your entry file
import { container, DependencyContainer } from 'tsyringe';
import { Logger } from './logging/Logger';
import { EnvValidator} from './configuration/ConfigurationValidator';
import { Program } from './Program';
import { config as dotenv_config } from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Options } from './configuration/models/Options';
import MarkdownIt from 'markdown-it';
import OpenAI from 'openai';
import { ClientOptions } from 'openai';
import { MarkdownToAudioProcessor } from './processors/MarkdownToAudioProcessor';
import { OpenAIImageProcessor } from './processors/OpenAIImageProcessor';
import { TesseractImageProcessor } from './processors/TesseractImageProcessor';
import { TextToSpeechProcessor } from './processors/TextToSpeechProcessor';
import { ConfigLoader } from './configuration/ConfigLoader';

function configureDI():DependencyContainer {

    // Register your dependencies
    container.registerSingleton(ConfigLoader);
    container.registerSingleton(Logger );
    container.registerSingleton(Program);
    container.registerSingleton(EnvValidator);
    container.registerSingleton(MarkdownToAudioProcessor);
    container.registerSingleton(OpenAIImageProcessor);
    container.registerSingleton(TesseractImageProcessor);
    container.registerSingleton(TextToSpeechProcessor);

    container.register(Options, {
        useFactory: () => {
            // Load environment variables from .env file
            dotenv_config();

            // Load command-line arguments
            const argv = yargs(hideBin(process.argv)).argv as { [key: string]: unknown };

            // Load configuration from config.json
            const configLoader = container.resolve(ConfigLoader);
            const config = configLoader.loadConfig('./config.json');

            // Define final configuration with the correct priority
            const finalConfig:Options = new Options(argv, config);

            return finalConfig;
        },
    });
    
    container.registerInstance(MarkdownIt,  new MarkdownIt());
    container.register(OpenAI, {

        useFactory: () => {
            const options = container.resolve(Options);
            const clientOptions: ClientOptions = {
                apiKey: options.OPENAI_API_KEY,
            };
            return new OpenAI(clientOptions);
        },
    });

    return container.createChildContainer();
}

export default configureDI;
