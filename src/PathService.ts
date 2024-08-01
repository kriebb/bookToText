import { injectable } from "tsyringe";
import * as fs from 'fs-extra';
import { ApplicationOptions } from "./ApplicationOptions";
import { File } from './models/File';
import path from "path";
import { FILE_EXTENSIONS } from "./constants";

@injectable()
export class PathService {
    async getAudioFiles():Promise<File[]> {
        return this.readFilesFromDirectory(this.getOutputAudioDirectory().directoryBase);
    }
    constructor(private options: ApplicationOptions) {}

    async ensureDirectoriesExist(): Promise<void> {
        await fs.ensureDir(this.options.outputBaseDirectory);
        await fs.ensureDir(this.options.inputImagesDirectory);
    }

    getMarkdownFile(): File {
        return new File( this.options.outputRecognizedTextFile, FILE_EXTENSIONS.md, this.options.outputBaseDirectory);
    }

    async getMarkdownContent(): Promise<string> {
        const markdownFile = this.getMarkdownFile();
        const content = await markdownFile.readContent();
        return content.toString('utf-8');
    }

    getOutputAudioDirectory(): File {
        return new File('', '', this.options.outputAudioSubDirectory);
    }

    getConcatenatedAudioFile(): File {
        return new File(this.options.concatenatedAudioFile, '', this.options.outputAudioSubDirectory);
    }

    getImageOutputFile(name: string, extension: string): File {
        return new File(name, extension, this.options.outputBaseDirectory);
    }

    async readFilesFromDirectory(directoryPath: string): Promise<File[]> {
        const files = await fs.readdir(directoryPath);
        return files.map(file => File.fromPath(path.join(directoryPath, file)));
    }

    async readInputImages(): Promise<File[]> {
        return this.readFilesFromDirectory(this.options.inputImagesDirectory);

    }
}