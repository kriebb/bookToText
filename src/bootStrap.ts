
import { injectable } from 'tsyringe';
import 'dotenv/config';
import configureDI from './containerRegistrationServices';
import { Logger } from './logger';
import { ApplicationOptions } from './ApplicationOptions';
import { PathService } from './PathService';
import { MESSAGES } from './constants';
import { TesseractProcessor } from './processors/TesseractImageProcessor';
import { TextProcessor } from './processors/TextProcessor';
import { MarkdownProcessor as MarkdownToAudioProcessor } from './processors/MarkdownProcessor';
import { OpenAIProcessor } from './processors/OpenAIProcessor';

@injectable()
export class Bootstrap {
    constructor(
        private logger: Logger,
        private TesseractImageToTextProcessor: TesseractProcessor,
        private TextToAudioProcessor: TextProcessor,   
        private MarkdownProcessor: MarkdownToAudioProcessor,
        private OpenAIImageToTexxtProcessor: OpenAIProcessor,
        private pathService: PathService,

        private options: ApplicationOptions

    ) {}

    boot = async (): Promise<void> => {
        this.logger.info('Starting the bootstrapping process');
        configureDI();
        await this.pathService.ensureDirectoriesExist();

        if (this.options.shouldProcessImages) {
            await this.OpenAIImageToTexxtProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }

        if (this.options.shouldProcessImagesWithTesseract) {
            await this.TesseractImageToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }

        if (this.options.shouldConvertMarkdownToAudio) {
            await this.MarkdownProcessor.process();
        }

        if (this.options.shouldMergeAudioFiles) {
            const inputFiles = await this.pathService.getAudioFiles();
            const outputFile = this.pathService.getConcatenatedAudioFile();
            await this.TextToAudioProcessor.mergeAudioFiles(inputFiles, outputFile);
        }
    }

}