import { injectable } from 'tsyringe';
import Sharp from 'sharp';
import { Logger } from '../logging/Logger';
import { Options } from '../configuration/models/Options';
import { PathService } from '../fileSystem/PathService';
import { File } from '../fileSystem/models/File';
import { BaseProcessor } from './BaseProcessor';

@injectable()
export class ImageProcessor extends BaseProcessor {

    constructor(
        protected pathService: PathService,
        protected options: Options,
        protected logger: Logger
    ) {
        super();
    }

    process(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async createJpeg(inputFile: File, outputFile: File): Promise<void> {
        await Sharp(inputFile.fullPath).jpeg().toFile(outputFile.fullPath);
    }
}