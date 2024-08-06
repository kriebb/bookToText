import OpenAI from 'openai';
import path from 'path';
import { injectable } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { Options } from '../configuration/models/Options';
import { MESSAGES, MAX_OPENAI_MODEL_LENGTH,  HEADER_CONTENT_TYPE, TTS_MODEL, TTS_VOICE, TTS_RESPONSE_FORMAT, MAX_TOKENS_BUFFER, SENTENCE_REGEX } from '../configuration/Constants';
import { File } from '../fileSystem/models/File';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
import { PathService } from '../fileSystem/PathService';
import { BaseProcessor } from './BaseProcessor';
import { MarkdownFile } from '../fileSystem/models/MarkdownFile';
@injectable()
export class TextFileMergerProcessor extends BaseProcessor {

    constructor(
        private logger: Logger,
        private pathService: PathService
    ) {
        super();
    }

   override async process(): Promise<void> {
        const inputFiles = await this.pathService.getMarkdownFiles("part");
        const outputFile = this.pathService.getMarkdownFile();
        await this.mergeTextFiles(inputFiles, outputFile);    
    }


    async mergeTextFiles(inputFiles: MarkdownFile[], outputFile: MarkdownFile): Promise<void> {
        this.logger.info(`Merging audio files to ${outputFile.fullPath}`);
        this.logger.info(`Input files: ${inputFiles.map(file => file.fullPath).join(', ')}`);

        await inputFiles.forEach(async inputFile => {
            const content = await inputFile.readContentAsString('utf-8');
            await outputFile.appendContent(content);
        });


    }

}