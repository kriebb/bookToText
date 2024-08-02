import { injectable } from 'tsyringe';
import MarkdownIt from 'markdown-it';
import { Options as Options } from '../configuration/models/Options';
import { REMOVE_BOLD_REGEX, REMOVE_ITALICS_REGEX, REMOVE_LINE_BREAKS_REGEX, COLLAPSE_SPACES_REGEX, MESSAGES } from '../configuration/Constants';
import { PathService } from '../fileSystem/PathService';
import { TextToSpeechProcessor } from './TextToSpeechProcessor';
import { Logger } from '../logging/Logger';


@injectable()
export class MarkdownToAudioProcessor {
    constructor(
        private md: MarkdownIt,
        private pathService: PathService,
        private textToSpeechProcessor: TextToSpeechProcessor,
        private options: Options,
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
        const markdownFile = this.pathService.getMarkdownFile();

        const textContent = await markdownFile.readContentAsString('utf-8');
        const sections = this.textToSpeechProcessor.splitText(textContent);
        for (let i = 0; i < sections.length; i++) {
            const enhancedText = await this.textToSpeechProcessor.enhanceText(sections[i]);
            if (!enhancedText) break;
            await markdownFile.appendContent(`${enhancedText}\n\n`);
            await this.textToSpeechProcessor.convertTextToAudio(enhancedText, i + 1, this.pathService.getOutputAudioDirectory().basePath);;
        }
        this.logger.info(`${MESSAGES.enhancementComplete} ${this.options.outputRecognizedTextFile}`);
    }
}