import Sharp from 'sharp';
import { File } from './File';
export class ImageFile extends File {
    async createJpeg(jpgImageFile: File) {
        await Sharp(this.fullPath).jpeg().toFile(jpgImageFile.fullPath);
    }
}

