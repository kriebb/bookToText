import { injectable } from 'tsyringe';
import MarkdownIt from 'markdown-it';
import { Options as Options } from '../configuration/models/Options';
import { REMOVE_BOLD_REGEX, REMOVE_ITALICS_REGEX, REMOVE_LINE_BREAKS_REGEX, COLLAPSE_SPACES_REGEX, MESSAGES, MAX_OPENAI_MODEL_LENGTH, HEADER_CONTENT_TYPE, MAX_TOKENS_BUFFER, SENTENCE_REGEX, TTS_MODEL, TTS_RESPONSE_FORMAT, TTS_VOICE } from '../configuration/Constants';
import { PathService } from '../fileSystem/PathService';
import { AudioMergerProcessor } from './AudioMergerProcessor';
import { Logger } from '../logging/Logger';
import OpenAI from 'openai';
import path from 'path';
import * as fs from 'fs-extra';
import { BaseProcessor } from './BaseProcessor';


@injectable()
export class MarkdownToAudioProcessor extends BaseProcessor {
    constructor(
        private md: MarkdownIt,
        private pathService: PathService,
        private openai: OpenAI,
        private options: Options,
        private logger: Logger
    ) {
        super();
    }

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

    override async process(): Promise<void> {
        const markdownFile = this.pathService.getMarkdownFile();

        const textContent = await markdownFile.readContentAsString('utf-8');
        const sections = this.splitText(textContent);
        for (let i = 0; i < sections.length; i++) {
            const enhancedText = await this.enhanceText(sections[i]);
            if (!enhancedText) break;
            await markdownFile.appendContent(`${enhancedText}\n\n`);
            await this.convertTextToAudio(enhancedText, i + 1, this.pathService.getOutputAudioDirectory().basePath);;
        }
        this.logger.info(`${MESSAGES.enhancementComplete} ${this.options.outputRecognizedTextFile}`);
    }

    
    splitText = (text: string): string[] => {
        const maxLength = MAX_OPENAI_MODEL_LENGTH - MAX_TOKENS_BUFFER;

        const sentences = text.match(SENTENCE_REGEX) || [];
        let currentChunk = '';
        const result = [];
        sentences.forEach(sentence => {
            if (currentChunk.length + sentence.length <= maxLength) {
                currentChunk += sentence;
            } else {
                result.push(currentChunk);
                currentChunk = sentence;
            }
        });
        if (currentChunk) {
            result.push(currentChunk);
        }
        return result;
    }
    
    async enhanceText(text: string): Promise<string | undefined> {
        const systemPrompt = this.options.prompts?.enhanceText?.system;
        if (!systemPrompt) {
            this.logger.warn(MESSAGES.noSystemPromptEnhanceText);
            return undefined;
        }

        const systemMessage: OpenAI.ChatCompletionSystemMessageParam = { role: 'system', content: systemPrompt };
        const userPrompt = this.options.prompts?.enhanceText?.user;
        if (!userPrompt) {
            this.logger.warn(MESSAGES.noUserPromptEnhanceText);
            return undefined;
        }

        const userMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: `${userPrompt}"${text}"`,
        };

        const maxTokens = Math.max(0, MAX_OPENAI_MODEL_LENGTH - systemPrompt.length);
        if (maxTokens === 0) {
            this.logger.warn(MESSAGES.maxTokensZero);
            return undefined;
        }

        const body = {
            model: this.options.openaiModel,
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };

        const options: OpenAI.RequestOptions = {
            headers: { 'Content-Type': HEADER_CONTENT_TYPE },
        };

        try {
            const response: OpenAI.ChatCompletion = await this.openai.chat.completions.create(body, options);
            const description = response?.choices?.[0]?.message?.content?.trim() || '';
            return description;
        } catch (error) {
            this.logger.error(`${MESSAGES.errorOpenAiApiCall} ${error}`);
            return undefined;
        }
    }
    
    async convertTextToAudio(text: string, index: number, outputDir: string): Promise<void> {
        const response = await this.openai.audio.speech.create({
            model: TTS_MODEL,
            input: text,
            voice: TTS_VOICE,
            response_format: TTS_RESPONSE_FORMAT,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(path.join(outputDir, `part-${index}.mp3`), buffer);
    }
}