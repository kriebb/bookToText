import { injectable } from "tsyringe";
import * as fs from 'fs-extra';
import { Options } from "../configuration/models/Options";
import { File } from './models/File';
import path from "path";
import { FILE_EXTENSIONS } from "../configuration/Constants";
import { ImageFile } from "./models/ImageFile";
import { AudioFile } from "./models/AudioFile";
import { Directory } from "./models/Directory";
import { MarkddownFile } from "./models/MarkddownFile";
import { Logger } from "../logging/Logger";

@injectable()
export class PathService {
    constructor(private options: Options, private logger: Logger) {}

    async ensureDirectoriesExist(): Promise<void> {
        this.logger.info('Ensuring directories exist...');
        await fs.ensureDir(this.options.outputBaseDirectory).then(() => { this.logger.info(this.options.outputBaseDirectory + " exsts") }).catch((error) => { this.logger.error(error)}).finally(() => {});
        await fs.ensureDir(this.options.inputImagesDirectory).then(() => { this.logger.info(this.options.inputImagesDirectory + " exsts") }).catch((error) => { this.logger.error(error)}).finally(() => {});;
    }

    getMarkdownFile(): MarkddownFile {
        return new MarkddownFile( this.options.outputRecognizedTextFile, FILE_EXTENSIONS.md, this.options.outputBaseDirectory);
    }
    async getAudioFiles(filter:string):Promise<AudioFile[]> {
        return this.readFilesFromDirectory(AudioFile,this.getOutputAudioDirectory().basePath, filter);
    }

    getOutputAudioDirectory(): Directory {
        return new Directory(this.options.outputAudioSubDirectory);
    }

    getConcatenatedAudioFile(): AudioFile {
        return new AudioFile(this.options.concatenatedAudioFile, FILE_EXTENSIONS.mp3, this.options.outputAudioSubDirectory);
    }

    getImageOutputFile(name: string, extension: string): ImageFile {
        return new ImageFile(name, extension, this.options.outputBaseDirectory);
    }

    async readFilesFromDirectory<T extends File>(fileClass: typeof File,directoryPath: string, filter:string | undefined = undefined): Promise<T[]> {
        const files = await fs.readdir(directoryPath);
        if(!filter) return files.map(file => File.fromPath<T>(fileClass,path.join(directoryPath, file)));
        return files.filter(file => file.includes(filter)).map(file => File.fromPath<T>(fileClass,path.join(directoryPath, file)));
    }

    async readInputImages(): Promise<ImageFile[]> {
        return this.readFilesFromDirectory(ImageFile,this.options.inputImagesDirectory);

    }
}