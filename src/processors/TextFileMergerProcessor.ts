import { injectable } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { PathService } from '../fileSystem/PathService';
import { BaseProcessor } from './BaseProcessor';
import { MarkdownFile, XHTMLFile } from '../fileSystem/models/MarkdownFile';
import TurndownService from 'turndown';
import { FILE_EXTENSIONS } from '../configuration/Constants';
var turndownPluginGfm = require('turndown-plugin-gfm')

@injectable()
export class TextFileMergerProcessor extends BaseProcessor {

    constructor(
        private logger: Logger,
        private pathService: PathService
    ) {
        super();
    }

    override async process(): Promise<void> {
        this.logger.info(`Listing files with extension ${FILE_EXTENSIONS.markdownXHTML}`);

        const inputFiles = await this.pathService.getMarkdownFiles(FILE_EXTENSIONS.markdownXHTML);
        const outputFile = this.pathService.getOutputRecognizedTextFile();
        const outputFileXhtml = this.pathService.getOutputRecognizedTextFile(FILE_EXTENSIONS.md);
        await this.mergeTextFiles(inputFiles, outputFile, outputFileXhtml);    
    }

    async mergeTextFiles(inputFiles: MarkdownFile[], outputFile: MarkdownFile, outputFileXHtml: XHTMLFile): Promise<void> {
        this.logger.info(`Merging text files to ${outputFile.fullPath}`);
        this.logger.info(`Input files for merging: ${inputFiles.map(file => file.fullPath).join(', ')}`);

        const turndownService = new TurndownService({ });
        turndownService.use(turndownPluginGfm.gfm);

        for (const inputFile of inputFiles) {
            const content = await inputFile.readContentAsString('utf-8');
            await outputFileXHtml.appendContent(content);
            const markdownContent = turndownService.turndown(content);
            await outputFile.appendContent(markdownContent);
        

        }
    }
}