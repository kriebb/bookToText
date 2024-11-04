import { injectable } from 'tsyringe';
import fs from 'fs-extra';
import path from 'path';
import { BaseProcessor } from './BaseProcessor';
import { Options } from '../configuration/models/Options';

@injectable()
export class PdfToImageProcessor implements BaseProcessor {
    constructor(private options: Options) { }

    async process(): Promise<void> {
        const pdfPath = this.options.inputPdfFile; // Replace with the path to your PDF file
        const outputDir = this.options.inputImagesDirectory; // Replace with the path to your output directory

        // Ensure the output directory exists
        await fs.ensureDir(outputDir);

        // Some PDFs need external cmaps.
        const CMAP_URL = path.join(__dirname, '../../node_modules/pdfjs-dist/cmaps/');
        const CMAP_PACKED = true;

        // Where the standard fonts are located.
        const STANDARD_FONT_DATA_URL = path.join(__dirname, '../../node_modules/pdfjs-dist/standard_fonts/');

        // Load the PDF file
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

        const loadingTask = pdfjsLib.getDocument({
            data,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
            standardFontDataUrl: STANDARD_FONT_DATA_URL,
        });

        try {
            const pdfDocument = await loadingTask.promise;
            console.log("# PDF document loaded.");
            const numPages = pdfDocument.numPages;

            // Render each page to an image
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvasFactory = pdfDocument.canvasFactory as any;

                const canvasAndContext = canvasFactory.create(
                    viewport.width,
                    viewport.height
                );

                const renderContext = {
                    canvasContext: canvasAndContext.context,
                    viewport,
                };

                const renderTask = page.render(renderContext);
                await renderTask.promise;

                // Convert the canvas to an image buffer
                const image = canvasAndContext.canvas.toBuffer('image/png');
                const formattedIndex = i.toString().padStart(4, '0');
                const outputFilePath = path.join(outputDir, `page-${formattedIndex}.png`);
                await fs.writeFile(outputFilePath, image);

                console.log(`# Page ${i} rendered and saved as ${outputFilePath}`);
                // Release page resources
                page.cleanup();
            }

            console.log("# End of Document");
        } catch (reason) {
            console.log(reason);
        }
    }
}