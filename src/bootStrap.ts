
import { injectable } from 'tsyringe';
import 'dotenv/config';
import configureDI from './ContainerRegistrationServices';
import { Logger } from './logging/Logger';
import { Options } from './configuration/models/Options';
import { PathService } from './fileSystem/PathService';
import { MESSAGES } from './configuration/Constants';
import { TesseractImageProcessor } from './processors/TesseractImageProcessor';
import { TextToSpeechProcessor } from './processors/TextToSpeechProcessor';
import { MarkdownToAudioProcessor  } from './processors/MarkdownToAudioProcessor';
import { OpenAIImageProcessor } from './processors/OpenAIImageProcessor';

@injectable()
export class Bootstrap {
    constructor(
        private logger: Logger,
        private tesseractImageToTextProcessor: TesseractImageProcessor,
        private textToSpeechProcessor: TextToSpeechProcessor,   
        private markdownToAudioProcessor: MarkdownToAudioProcessor,
        private openAIImageToTextProcessor: OpenAIImageProcessor,
        private pathService: PathService,

        private options: Options

    ) {}

    boot = async (): Promise<void> => {
        this.logger.info('Starting the bootstrapping process');

        await this.pathService.ensureDirectoriesExist();

        if (this.options.shouldProcessImages) {
            await this.openAIImageToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }

        if (this.options.shouldProcessImagesWithTesseract) {
            await this.tesseractImageToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }

        if (this.options.shouldConvertMarkdownToAudio) {
            await this.markdownToAudioProcessor.process();
        }

        if (this.options.shouldMergeAudioFiles) {
            const inputFiles = await this.pathService.getAudioFiles();
            const outputFile = this.pathService.getConcatenatedAudioFile();
            await this.textToSpeechProcessor.mergeAudioFiles(inputFiles, outputFile);
        }
    }

}