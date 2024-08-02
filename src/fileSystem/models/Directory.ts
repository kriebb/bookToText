
import * as fs from 'fs-extra';
import * as path from 'path';
import { File } from './File';
export class Directory {
    constructor(public basePath: string) {}

    async ensureExists(): Promise<void> {
        return fs.ensureDir(this.basePath);
    }

    async listFiles<T extends File>(fileClass: new (name: string, extension: string, directoryBase: string) => T): Promise<T[]> {
        const fileNames = await fs.readdir(this.basePath);
        return fileNames.map(fileName => {
            const { name, ext } = path.parse(fileName);
            return new fileClass(name, ext.toLowerCase(), this.basePath);
        });
    }

    getPath(filename: string): string {
        return path.join(this.basePath, filename);
    }
}

