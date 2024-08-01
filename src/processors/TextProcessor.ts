import OpenAI from 'openai';
import path from 'path';
import { injectable } from 'tsyringe';
import { Logger } from '../logger';
import { ApplicationOptions } from '../ApplicationOptions';
import { MESSAGES, MAX_OPENAI_MODEL_LENGTH, OPENAI_MODEL, HEADER_CONTENT_TYPE, TTS_MODEL, TTS_VOICE, TTS_RESPONSE_FORMAT, MAX_TOKENS_BUFFER, SENTENCE_REGEX } from '../constants';
import { File } from '../models/File';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
@injectable()
export class TextProcessor {
    constructor(
        private logger: Logger,
        private openai: OpenAI,
        private options: ApplicationOptions
    ) {}

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
            model: OPENAI_MODEL,
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

    async mergeAudioFiles(inputFiles: File[], outputFile: File): Promise<void> {
        const command = ffmpeg();
        inputFiles.forEach(file => command.input(file.fullPath));
        return new Promise((resolve, reject) => {
            command
                .on('error', (err) => reject(err))
                .on('end', () => resolve())
                .mergeToFile(outputFile.fullPath, path.dirname(outputFile.fullPath));
        });
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