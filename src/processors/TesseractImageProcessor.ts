import { injectable } from 'tsyringe';
import { createWorker } from 'tesseract.js';
import { PathService } from '../PathService';
import { ApplicationOptions } from '../ApplicationOptions';
import { Logger } from '../logger';
import { File } from '../models/File';
import { BaseProcessor } from './BaseProcessor';
import { FILE_EXTENSIONS, MESSAGES } from '../constants';
import { ImageProcessor } from './ImageProcessor';

@injectable()
export class TesseractProcessor extends ImageProcessor implements BaseProcessor {
    constructor(
        pathService: PathService,
        options: ApplicationOptions,
        logger: Logger
    ) {
        super(pathService, options, logger);
    }

    async process(): Promise<void> {
        const worker = await createWorker();
        const imageFiles = await this.pathService.readInputImages();
        for (const imageFile of imageFiles) {
            const tesseractOcrFile = this.pathService.getImageOutputFile(imageFile.name, FILE_EXTENSIONS.tesseractOCR);
            if (await tesseractOcrFile.exists()) {
                this.logger.info(MESSAGES.tesseractAnalysisSkip.replace('{imageFile}', imageFile.name));
            } else {
                if (imageFile.extension === FILE_EXTENSIONS.jpg) {
                    const { data: { text: tesseractOCR } } = await worker.recognize(imageFile.fullPath);
                    await tesseractOcrFile.writeString(tesseractOCR);
                }
            }
        }
        await worker.terminate();
    }
}