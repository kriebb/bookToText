import { injectable } from 'tsyringe';
import Sharp from 'sharp';
import { Logger } from '../logging/Logger';
import { Options } from '../configuration/models/Options';
import { PathService } from '../fileSystem/PathService';
import { File } from '../fileSystem/models/File';

@injectable()
export class ImageProcessor {
    constructor(
        protected pathService: PathService,
        protected options: Options,
        protected logger: Logger
    ) {}

    async createJpeg(inputFile: File, outputFile: File): Promise<void> {
        await Sharp(inputFile.fullPath).jpeg().toFile(outputFile.fullPath);
    }
}