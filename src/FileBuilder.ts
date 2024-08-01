import path from 'path';
import { injectable } from 'tsyringe';
@injectable()
export class PathBuilder {

    private baseDirectory: string;
    private subDirectory: string|undefined;
    private fileName: string|undefined;
    private extension: string|undefined;

    constructor(baseDirectory: string) {
        this.baseDirectory = baseDirectory;
    }

    setSubDirectory(subDirectory: string): this {
        this.subDirectory = subDirectory;
        return this;
    }

    setFileName(fileName: string): this {
        this.fileName = fileName;
        return this;
    }

    setExtension(extension: string): this {
        this.extension = extension;
        return this;
    }

    public withPathParts(...parts: string[]): this {
        this.baseDirectory = path.join(this.baseDirectory, ...parts);
        return this;
    }

    public withExtension(extension: string): this {
        this.baseDirectory = `${this.baseDirectory}${extension}`;
        return this;
    }

    build(): string {
        let directory = this.baseDirectory;

        if (this.subDirectory) {
            directory = path.join(directory, this.subDirectory);
        }

        if (this.fileName) {
            return path.join(directory, `${this.fileName}${this.extension || ''}`);
        }

        return directory;
    }
}