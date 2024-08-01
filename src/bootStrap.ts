import { injectable } from 'tsyringe';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createWorker } from 'tesseract.js';
import Sharp from 'sharp';
import { OpenAI, ClientOptions } from 'openai';
import MarkdownIt from 'markdown-it';
import 'dotenv/config';
import configureDI from './containerRegistrationServices';
import { Logger } from './logger';
import ffmpeg from 'fluent-ffmpeg';

interface PageAnalysis {
    text: string;
}
@injectable()
export class Bootstrap {
    openai: OpenAI;
    IMAGES_DIR: string;
    OUTPUT_DIR: string;
    md: MarkdownIt;

    constructor(private logger: Logger) {
        // Load environment variables from .env
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const configuration: ClientOptions = {
            apiKey: OPENAI_API_KEY,
        };
        this.IMAGES_DIR = 'C:/Users/KristofRiebbels/OneDrive - Xebia/Documenten/artc trail';
        this.OUTPUT_DIR = './output';
        this.openai = new OpenAI(configuration);
        this.md = new MarkdownIt();

    }

    boot = async (): Promise<void> => {
        this.logger.info('Starting the bootstrapping process');

        configureDI();

        //Do this with options and split up the bootStrap.ts
        //await this.processImages().then(() => {
        //    this.logger.info('Images processed');
        //}).catch((error) => {  this.logger.error(`Error processing images: ${error}`); });


        //Convert one big markdown file to audio
        //const markdownFilePath = path.join(this.OUTPUT_DIR, 'fullfile\\Trekking in Greenland.full.md');
        //const outputDir = path.join(this.OUTPUT_DIR, 'fullfile\\audio');

        //await this.processMarkdownToAudio(markdownFilePath, outputDir);

        const outputDir = path.join(this.OUTPUT_DIR, 'fullfile\\audio');

        const inputFiles = fs.readdirSync(outputDir).map(file => path.join(outputDir, file));

        const outputFile = 'fullfile\\audio\\final-audiobook.mp3';

        await this.mergeAudioFiles(inputFiles, outputFile)
            .then(() => console.log('Concatenation complete.'))
            .catch(err => console.error('Concatenation failed:', err));
    }


    splitText = (text: string, maxLength: number): string[] => {
        const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
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

    enhanceText = async (text: string): Promise<string> => {
        const prompt = `
            You are reading a book where each section should be fluent for Text-To-Speech. Ensure sentences flow naturally with no lines in between and broken sentences. Because TTS will read everything on the page, do not include pagenumbers or specific legends or detailed publish information. Do not include summary of each page. If you do, ensure that is added in a fluent context and that the stuff is told naturally. Add context where necessary. At the end of each chatper, provide a summary, but only if you can detect the end of a chapter.
        `;


        const systemMessage: OpenAI.ChatCompletionSystemMessageParam = { role: 'system', content: prompt };
        const userMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: `The follwing is the content: \n\n"${text}"`,
        };


        const body = {
            model: 'gpt-4o',
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            max_tokens: 4095 - prompt.length,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };

        const options: OpenAI.RequestOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response: OpenAI.ChatCompletion = await this.openai.chat.completions.create(body, options);
        const description = response?.choices?.[0]?.message?.content?.trim() || '';

        return description ?? '';
    }

    mergeAudioFiles = async (inputFiles: string[], outputFile: string): Promise<void> => {
        const command = ffmpeg();

        inputFiles.forEach(file => {
            command.input(file);
        });

        return new Promise((resolve, reject) => {
            command
                .on('error', (err) => {
                    console.error('Error: ' + err.message);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Files have been concatenated successfully.');
                    resolve();
                })
                .mergeToFile(outputFile, path.dirname(outputFile));
        });
    };

    preprocessMarkdown = (markdownContent: string): string => {
        // Convert markdown to plain text, optimizing for TTS
        let textContent = this.md.render(markdownContent);
        textContent = textContent.replace(/(?:\*\*|__)(.*?)(?:\*\*|__)/g, ''); // Remove bold
        textContent = textContent.replace(/(?:\*|_)(.*?)(?:\*|_)/g, ''); // Remove italics
        textContent = textContent.replace(/(?:\r\n|\r|\n)/g, ' '); // Remove line breaks, replace with spaces
        textContent = textContent.replace(/\s+/g, ' '); // Collapse multiple spaces
        return textContent;
    }

    processMarkdownToAudio = async (mdFilePath: string, outputDir: string): Promise<void> => {
        const markdownContent = await fs.readFile(mdFilePath, 'utf-8');
        const textContent = this.preprocessMarkdown(markdownContent);

        const maxLength = 4095 - 1000; // Keeping some buffer for additional prompt/context
        const sections = this.splitText(textContent, maxLength);

        const enhancedSections: string[] = [];
        const enhancedSectionFilePath = path.join(outputDir, 'enhanced.md');

        for (let i = 0; i < sections.length; i++) {
            const enhancedText = await this.enhanceText(sections[i]);
            enhancedSections.push(enhancedText);
            await fs.appendFile(enhancedSectionFilePath, enhancedText + '\n\n');
            await this.convertTextToAudio(enhancedText, outputDir, i + 1);
        }

        this.logger.info('Enhanced sections written to enhanced.md');
    }

    convertTextToAudio = async (text: string, outputDir: string, index: number): Promise<void> => {
        const response = await this.openai.audio.speech.create({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
            response_format: 'mp3',
        });

        const partFilename = path.join(outputDir, `part-${index}.mp3`);
        const buffer = Buffer.from(await response.arrayBuffer());
        const speechFile = path.resolve(partFilename);

        await fs.promises.writeFile(speechFile, buffer);
        this.logger.info(`Audio part generated at: ${partFilename}`);
    }


    analyzeImage = async (imagePath: string, previousContext: PageAnalysis | null): Promise<PageAnalysis> => {
        const prompt = `
                You are reading a book where each page contains both text and images. You OCR the text on the page that is an image. When you detect an image, you add on the right location a description of the image and you add a placeholder for the image. To ensure you can OCR the page with good context, you will get the previous page as text. Ensure the formatting is taken over and you use advanced markdown features. Ensure you generate a title for that page. At the end of each page, you will make a very short summary of the page, so the reader knows what is important.
            `;

        const systemMessage: OpenAI.ChatCompletionSystemMessageParam = { role: 'system', content: prompt };
        const userPreviousPageMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: `The previous page said: "${previousContext?.text || 'N/A'}"`,
        };

        const imageFile = await fs.readFile(imagePath);
        const base64Image = imageFile.toString('base64');
        const arrayContent: OpenAI.ChatCompletionContentPart[] = [
            {
                type: 'image_url',
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'auto',
                },
            },
        ];
        const userImageMessage: OpenAI.ChatCompletionUserMessageParam = {
            role: 'user',
            content: arrayContent,
        };



        const body = {
            model: 'gpt-4o',
            messages: [systemMessage, userPreviousPageMessage, userImageMessage],
            temperature: 1,
            max_tokens: 4095,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };

        const options: OpenAI.RequestOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response: OpenAI.ChatCompletion = await this.openai.chat.completions.create(body, options);
        const description = response?.choices?.[0]?.message?.content?.trim() || '';

        return { text: description };
    }

    generateMarkdown = (imageFile: string, pageContext: PageAnalysis): string => {
        const markdown = `${this.md.render(pageContext.text)}`
        return markdown;
    }



    processImagesUsingTesseract = async (): Promise<void> => {
        const worker = await createWorker();

        const imageFiles = await fs.readdir(this.IMAGES_DIR);

        for (const imageFile of imageFiles) {

            if (await fs.exists(path.join(this.OUTPUT_DIR, `${path.parse(imageFile).name}.tesseract.ocr.md`))) {
                this.logger.info(`Skipping ${imageFile} for tesseract analysis as it already exists in the output directory`);
            }
            else {
                const imagePath = path.join(this.IMAGES_DIR, imageFile);
                const imageExt = path.extname(imagePath).toLowerCase();

                if (imageExt === '.tif' || imageExt === '.tiff') {

                    const { data: { text: tesseractOCR } } = await worker.recognize(imagePath);
                    await fs.outputFile(path.join(this.OUTPUT_DIR, `${path.parse(imageFile).name}.tesseract.ocr.md`), tesseractOCR);
                }
            }
        }

        await worker.terminate();


    }

    processImages = async (): Promise<void> => {

        const imageFiles = await fs.readdir(this.IMAGES_DIR);

        let previousContext: PageAnalysis | null = null;

        for (const imageFile of imageFiles) {
            const imagePath = path.join(this.IMAGES_DIR, imageFile);
            const imageExt = path.extname(imagePath).toLowerCase();




            if (await fs.exists(path.join(this.OUTPUT_DIR, `${path.parse(imageFile).name}.md.xhtml`))) {
                this.logger.info(`Skipping ${imageFile} as it already exists in the output directory`);
            }
            else {
                if (imageExt === '.tif' || imageExt === '.tiff') {
                    const jpgImagePath = path.join(this.IMAGES_DIR, `${path.basename(imageFile, imageExt)}.jpg`);
                    await Sharp(imagePath).jpeg().toFile(jpgImagePath);

                    const pageContext: PageAnalysis = await this.analyzeImage(jpgImagePath, previousContext);
                    const markdownContent = this.generateMarkdown(path.basename(jpgImagePath), pageContext);

                    await fs.outputFile(path.join(this.OUTPUT_DIR, `${path.parse(imageFile).name}.md.xhtml`), markdownContent);
                    previousContext = pageContext;
                }
                else {
                    this.logger.debug(`Skipping ${imageFile} as it is not a tiff file`);
                }
            }
        }

    }
}
