import 'reflect-metadata'; // Import this at the top of your entry file
import { container, DependencyContainer } from 'tsyringe';
import { Logger } from './logging/Logger';
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
import { AudioMergerProcessor } from './processors/AudioMergerProcessor';
import { ConfigLoader } from './configuration/ConfigLoader';
import fs from "fs-extra"
import { CONFIG_FILE_LOCATION, VARIABLE_MAPPING_FILE_LOCATION } from "./configuration/Constants";
import path from "path";
import { VariableDetailRepository } from './VariableDetailRepository';
import { VariableMappingService } from './VariableMappingService';

let config: Options | undefined = undefined;
let openAi: OpenAI | undefined = undefined;

function configureDI(): DependencyContainer {

    // Register your dependencies
    container.registerSingleton(ConfigLoader);
    container.registerSingleton(Logger);
    container.registerSingleton(Program);
    container.registerSingleton(MarkdownToAudioProcessor);
    container.registerSingleton(OpenAIImageProcessor);
    container.registerSingleton(TesseractImageProcessor);
    container.registerSingleton(AudioMergerProcessor);
    container.registerSingleton(VariableMappingService);
    container.registerInstance(VariableDetailRepository, new VariableDetailRepository(VARIABLE_MAPPING_FILE_LOCATION));


    container.register(Options, {
        useFactory: () => {
            if(config != undefined) {
                return config;
            }
            // Load environment variables from .env file
            dotenv_config();

            // Load command-line arguments
            const argv = yargs(hideBin(process.argv)).argv as { [key: string]: unknown };

            // Load configuration from config.json
            const configLoader = container.resolve(ConfigLoader);
            const logger = container.resolve(Logger);
            if (fs.existsSync(CONFIG_FILE_LOCATION)) {
                config = configLoader.loadConfig(argv,CONFIG_FILE_LOCATION);
                return config;
            }
            else {
                logger.info('Configuration file not found. Creating configuration file');
                const emptyConfig: Options = new Options();
                fs.writeFileSync(CONFIG_FILE_LOCATION, JSON.stringify(emptyConfig));
                config = configLoader.loadConfig(argv,CONFIG_FILE_LOCATION);

                const resolved = path.resolve(CONFIG_FILE_LOCATION);
                logger.info(`Configuration file created at ${resolved}`);
                return config;
            }
        },
    });

    container.registerInstance(MarkdownIt, new MarkdownIt());
    container.register(OpenAI, {

        useFactory: () => {
            if(openAi != undefined) {
                return openAi;
            }

            const options = container.resolve(Options);
            const clientOptions: ClientOptions = {
                apiKey: options.openaiApiKey.getValue(),
            };
            openAi = new OpenAI(clientOptions);
            return openAi;
        },
    });

    return container.createChildContainer();
}

export default configureDI;
