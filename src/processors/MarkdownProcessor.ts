import { injectable } from 'tsyringe';
import MarkdownIt from 'markdown-it';
import { ApplicationOptions } from '../ApplicationOptions';
import { REMOVE_BOLD_REGEX, REMOVE_ITALICS_REGEX, REMOVE_LINE_BREAKS_REGEX, COLLAPSE_SPACES_REGEX, MESSAGES } from '../constants';
import { PathService } from '../PathService';
import { TextProcessor } from './TextProcessor';
import { Logger } from '../logger';


@injectable()
export class MarkdownProcessor {
    constructor(
        private md: MarkdownIt,
        private pathService: PathService,
        private textProcessor: TextProcessor,
        private options: ApplicationOptions,
        private logger: Logger
    ) {}

    preprocessMarkdown(markdownContent: string): string {
        let textContent = this.md.render(markdownContent);
        const regexReplacements = [
            { regex: REMOVE_BOLD_REGEX, replacement: '' },
            { regex: REMOVE_ITALICS_REGEX, replacement: '' },
            { regex: REMOVE_LINE_BREAKS_REGEX, replacement: ' ' },
            { regex: COLLAPSE_SPACES_REGEX, replacement: ' ' }
        ];
        for (const { regex, replacement } of regexReplacements) {
            textContent = textContent.replace(regex, replacement);
        }
        return textContent;
    }

    async process(): Promise<void> {
        const textContent = await this.pathService.getMarkdownContent();
        const sections = this.textProcessor.splitText(textContent);
        const markdownFile = this.pathService.getMarkdownFile();
        for (let i = 0; i < sections.length; i++) {
            const enhancedText = await this.textProcessor.enhanceText(sections[i]);
            if (!enhancedText) break;
            await markdownFile.appendContent(`${enhancedText}\n\n`);
            await this.textProcessor.convertTextToAudio(enhancedText, i + 1, this.pathService.getOutputAudioDirectory().directoryBase);;
        }
        this.logger.info(`${MESSAGES.enhancementComplete} ${this.options.outputRecognizedTextFile}`);
    }
}