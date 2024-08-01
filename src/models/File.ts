
import * as fs from 'fs-extra';
import * as path from 'path';
import Sharp from 'sharp';

export class File {
    async createJpeg(jpgImageFile: File) {
        await Sharp(this.fullPath).jpeg().toFile(jpgImageFile.fullPath);
    }

    constructor(
        public name: string,
        public extension: string,
        public directoryBase: string
    ) {}


    get fullPath(): string {
        return path.join(this.directoryBase, `${this.name}${this.extension}`);
    }

    static fromPath(filePath: string): File {
        const { dir, name, ext } = path.parse(filePath);
        return new File(name, ext, dir);
    }

    async readContent(): Promise<Buffer> {
        return await fs.readFile(this.fullPath);
    }

    async appendContent(content: string): Promise<void> {
        await fs.appendFile(this.fullPath, content);
    }

    async writeContent(content: Buffer | string): Promise<void> {
        await fs.writeFile(this.fullPath, content);
    }

    async exists(): Promise<boolean> {
        return await fs.pathExists(this.fullPath);
    }

    async readAsBase64(): Promise<string> {
        const content = await this.readContent();
        return content.toString('base64');
    }

    async writeString(content: string): Promise<void> {
        await this.writeContent(content);
    }

    async writeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
        const buffer = Buffer.from(arrayBuffer);
        await this.writeContent(buffer);
    }
}