
import * as fs from 'fs-extra';
import * as path from 'path';
import { File } from './models/File';

export class FileFactory {
    static new<T extends File>(fileClass: typeof File, name: string, extension: string, basePath: string): T {
        return new fileClass(name, extension, basePath) as T;
    }
}
