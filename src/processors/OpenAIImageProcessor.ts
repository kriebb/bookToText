// processors/OpenAIProcessor.ts
import { injectable } from 'tsyringe';
import { Logger } from '../logging/Logger';
import { OpenAI } from 'openai';
import { PathService } from '../fileSystem/PathService';
import { Options } from '../configuration/models/Options';
import { File } from '../fileSystem/models/File';
import { BaseProcessor } from './BaseProcessor';
import { ImageProcessor } from './ImageProcessor';
import { FILE_EXTENSIONS, HEADER_CONTENT_TYPE, MAX_OPENAI_MODEL_LENGTH, MESSAGES } from '../configuration/Constants';
import MarkdownIt from 'markdown-it';

export interface OCRImageFile{
    text:string;
}
@injectable()
export class OpenAIImageProcessor extends ImageProcessor implements BaseProcessor {
    constructor(
        logger: Logger,
        private openai: OpenAI,
        pathService: PathService,
        options: Options,
        private md: MarkdownIt
    ) {
        super(pathService, options, logger);
    }

    async analyzeImage(file: File, previousContext: any): Promise<OCRImageFile | undefined> {
        const systemPrompt = this.options.prompts?.analyzeImage?.system;
        if (!systemPrompt) {
            this.logger.warn(MESSAGES.noSystemPromptAnalyzeImage);
            return undefined;
        }
        const systemMessage: OpenAI.ChatCompletionSystemMessageParam = { role: 'system', content: systemPrompt };
        const previousPagePrompt = this.options.prompts?.analyzeImage?.userPreviousPage;
        if (!previousPagePrompt) {
            this.logger.warn(MESSAGES.noUserPreviousPagePrompt);
            return undefined;
        }
        const userPreviousPageMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: `${previousPagePrompt}"${previousContext?.text || 'N/A'}"`,
        };
        const base64Image = await file.readAsBase64();
        const imageContent: OpenAI.ChatCompletionContentPart = {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'auto' },
        };
        const userImageMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: [imageContent],
        };
        const body = {
            model: this.options.openaiModel,
            messages: [systemMessage, userPreviousPageMessage, userImageMessage],
            temperature: 1,
            max_tokens: MAX_OPENAI_MODEL_LENGTH,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };
        const options: OpenAI.RequestOptions = {
            headers: { 'Content-Type': HEADER_CONTENT_TYPE },
        };
        const response: OpenAI.ChatCompletion = await this.openai.chat.completions.create(body, options);
        const description = response?.choices?.[0]?.message?.content?.trim() || '';
        return { text: description };
    }

    async process(): Promise<void> {
        const imageFiles = await this.pathService.readInputImages();
        let previousContext: any = null;
        for (const imageFile of imageFiles) {
            const xhtmlFile = this.pathService.getImageOutputFile(imageFile.name, FILE_EXTENSIONS.markdownXHTML);
            if (await xhtmlFile.exists()) {
                this.logger.info(MESSAGES.fileExistsSkip.replace('{imageFile}', imageFile.name));
            } else {
                if (imageFile.extension === FILE_EXTENSIONS.tiff || imageFile.extension === FILE_EXTENSIONS.tif) {
                    const jpgImageFile = this.pathService.getImageOutputFile(imageFile.name, FILE_EXTENSIONS.jpg);
                    await this.createJpeg(imageFile, jpgImageFile);

                    const pageContext = await this.analyzeImage(jpgImageFile, previousContext);
                    if (!pageContext) break;

                    const markdownContent = this.generateMarkdown(pageContext);
                    await xhtmlFile.writeString(markdownContent);
                    previousContext = pageContext;
                } else {
                    this.logger.debug(MESSAGES.nonTiffFileSkip.replace('{imageFile}', imageFile.name));
                }
            }
        }
    }

    generateMarkdown(pageContext: OCRImageFile): string {
        return this.md.render(pageContext.text);
    }
}