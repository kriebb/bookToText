
import { injectable } from 'tsyringe';
import 'dotenv/config';
import { Logger } from './logging/Logger';
import { Options } from './configuration/models/Options';
import { PathService } from './fileSystem/PathService';
import { MESSAGES } from './configuration/Constants';
import { TesseractImageProcessor } from './processors/TesseractImageProcessor';
import { AudioMergerProcessor } from './processors/AudioMergerProcessor';
import { MarkdownToAudioProcessor } from './processors/MarkdownToAudioProcessor';
import { OpenAIImageProcessor } from './processors/OpenAIImageProcessor';
import { TextFileMergerProcessor } from './processors/TextFileMergerProcessor';
import { PdfTextProcessor } from './processors/PdfTextProcessor';
import { PdfToImageProcessor } from './processors/PdfToImageProcessor';

@injectable()
export class Bootstrap {
    constructor(
        private logger: Logger,
        private pdfToImageProcessor: PdfToImageProcessor,
        private tesseractImageToTextProcessor: TesseractImageProcessor,
        private textToSpeechProcessor: AudioMergerProcessor,
        private markdownToAudioProcessor: MarkdownToAudioProcessor,
        private openAIImageToTextProcessor: OpenAIImageProcessor,
        private pdfToTextProcessor: PdfTextProcessor,
        private mergeTextFilesProcessor: TextFileMergerProcessor,
        private pathService: PathService,

        private options: Options

    ) { }

    boot = async (): Promise<void> => {
        this.logger.info('Starting the bootstrapping process');

        await this.pathService.ensureDirectoriesExist();


        if (this.options.shouldProcessImages && this.options.shouldExtractTextFromPdf) {

            await this.pdfToImageProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.pdfToImageProcessorError} ${error}`);
            });
        }
        if (this.options.shouldProcessImages) {
            this.logger.info(MESSAGES.processingImages);

            await this.openAIImageToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });


        }
        else {
            this.logger.info(MESSAGES.notProcessingImagesWithOpenAI);
        }

        if (this.options.shouldProcessImagesWithTesseract) {
            this.logger.info(MESSAGES.processingImagesWithTesseract);
            await this.tesseractImageToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }
        else {
            this.logger.info(MESSAGES.notProcessingImagesWithTesseract);

        }
        if (!this.options.shouldProcessImages && this.options.shouldExtractTextFromPdf) {
            this.logger.info(MESSAGES.processingExtratTextFromPdf);

            await this.pdfToTextProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorExtractingPdfToHtml} ${error}`);
            });

        }
        else {
            this.logger.info(MESSAGES.notProcessingExtratTextFromPdf);

        }
        if (this.options.shouldMergeTextFiles) {
            this.logger.info(MESSAGES.processingTextFiles);
            await this.mergeTextFilesProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            });
        }
        else {
            this.logger.info(MESSAGES.notProcessingTextFiles);
        }


        if (this.options.shouldConvertMarkdownToAudio) {
            this.logger.info(MESSAGES.convertingMarkdownToAudio);
            await this.markdownToAudioProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorMarkdownToAudioConversion} ${error}`);
            });;
        }
        else {
            this.logger.info(MESSAGES.notConvertingMarkdownToAudio);
        }

        if (this.options.shouldMergeAudioFiles) {
            this.logger.info(MESSAGES.mergingAudioFiles);
            await this.textToSpeechProcessor.process().catch((error) => {
                this.logger.error(`${MESSAGES.errorMergingAudioFiles} ${error}`);
            });;
        }
        else {
            this.logger.info(MESSAGES.notMergingAudioFiles);
        }
    }

}