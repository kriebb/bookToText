import { injectable } from 'tsyringe';
import Sharp from 'sharp';
import { Logger } from '../logger';
import { ApplicationOptions } from '../ApplicationOptions';
import { PathService } from '../PathService';
import { File } from '../models/File';

@injectable()
export class ImageProcessor {
    constructor(
        protected pathService: PathService,
        protected options: ApplicationOptions,
        protected logger: Logger
    ) {}

    async createJpeg(inputFile: File, outputFile: File): Promise<void> {
        await Sharp(inputFile.fullPath).jpeg().toFile(outputFile.fullPath);
    }
}