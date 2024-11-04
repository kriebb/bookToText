import * as fs from 'fs-extra';
import path from 'path';
import { BaseProcessor } from './BaseProcessor';
import { Options } from '../configuration/models/Options';
import { injectable } from 'tsyringe';
import { TextContent, TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

@injectable()
export class PdfTextProcessor implements BaseProcessor {
    constructor(private options: Options) { }

    async process(): Promise<void> {
        const pdfPath = this.options.inputPdfFile; // Replace with the path to your PDF file
        const outputDir = this.options.outputTextFileDirectory; // Replace with the path to your output directory

        // Ensure the output directory exists
        await fs.ensureDir(outputDir);

        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        const standardFontDataUrl = path.join(__dirname, '../../node_modules/pdfjs-dist/standard_fonts/');

        // Load the PDF file
        const loadingTask = pdfjsLib.getDocument({
            url: pdfPath,
            standardFontDataUrl: standardFontDataUrl
        });

        const pdfDoc = await loadingTask.promise;

        // Extract text from each page and write to an HTML file
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent({ includeMarkedContent: true });;
            const htmlContent = this.formatTextAsHtml(textContent);

            const formattedIndex = i.toString().padStart(4, '0');
            const outputFilePath = path.join(outputDir, `page-${formattedIndex}.md.xhtml`);
            await fs.writeFile(outputFilePath, htmlContent);
        }
    }

    private formatTextAsHtml(textContent: TextContent): string {
        // Convert the text content to HTML
        let html = ''
        textContent.items.forEach((item: (TextItem | TextMarkedContent)) => {
            if (this.isTextItem(item)) {
                html += `${item.str}`;
                if (item.hasEOL)
                    html += `\r\n`
            } else {
                const markedContent = item as TextMarkedContent;
                // Handle TextMarkedContent
                switch (markedContent.type) {
                    case 'beginMarkedContent':
                        html += '<p><div class="marked-content">';
                        html += `\r\n`
                        break;
                    case 'beginMarkedContentProps':
                        html += `<div class="marked-content" data-id="${markedContent.id}">`;
                        html += `\r\n`
                        break;
                    case 'endMarkedContent':
                        html += `\r\n`
                        html += '</div></p>';
                        break;
                    default:
                        console.log(`Unknown marked content type: ${markedContent.type}`);

                }

            }
        });

        return html;
    }

    private isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
        return (item as TextItem).str !== undefined;
    }
}