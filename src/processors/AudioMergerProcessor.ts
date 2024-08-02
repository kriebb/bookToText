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
import { AudioFile } from '../fileSystem/models/AudioFile';
@injectable()
export class AudioMergerProcessor {

    constructor(
        private logger: Logger,
        private openai: OpenAI,
        private options: Options,
        private pathService: PathService
    ) {}

    async process() {
        const inputFiles = await this.pathService.getAudioFiles("part");
        const outputFile = this.pathService.getConcatenatedAudioFile();
        await this.mergeAudioFiles(inputFiles, outputFile);    
    }


    async mergeAudioFiles(inputFiles: AudioFile[], outputFile: AudioFile): Promise<void> {
        this.logger.info(`Merging audio files to ${outputFile.fullPath}`);
        this.logger.info(`Input files: ${inputFiles.map(file => file.fullPath).join(', ')}`);

        const command = ffmpeg();
        inputFiles.forEach(file => command.input(file.fullPath));
        return new Promise((resolve, reject) => {
            command
                .on('error', (err) => reject(err))
                .on('end', () => resolve())
                .mergeToFile(outputFile.fullPath, path.dirname(outputFile.fullPath));
        });
    }

}