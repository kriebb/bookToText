import { SecretString } from "../SecretString";

/**
 * Configuration options for the application.
 */
export class Options {
    /**
     * API key for accessing OpenAI services.
     * @example "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     */
    openaiApiKey: SecretString;

    /**
     * Model name to be used with OpenAI.
     * @example "gpt-4"
     */
    openaiModel: string;

    /**
     * Base directory for output files.
     * @example "/path/to/output"
     */
    outputBaseDirectory: string;

    /**
     * Subdirectory for output audio files.
     * @example "audio"
     */
    outputAudioSubDirectory: string;

    /**
     * Path to the concatenated audio file.
     * @example "/path/to/output/audio/concatenated.mp3"
     */
    concatenatedAudioFile: string;

    /**
     * Flag to indicate whether to merge audio files.
     * @example true
     */
    shouldMergeAudioFiles: boolean;

    /**
     * Flag to indicate whether to merge text files.
     * @example true
     */
    shouldMergeTextFiles: boolean;

    /**
     * Flag to indicate whether to convert markdown to audio.
     * @example true
     */
    shouldConvertMarkdownToAudio: boolean;

    /**
     * Path to the file where recognized text will be output.
     * @example "/path/to/output/recognized.txt"
     */
    outputRecognizedTextFile: string;

        /**
     * Path to the file where text will be output from the image.
     * @example "/path/to/output.txt"
     */
        outputTextFileDirectory: string;

    /**
     * Flag to indicate whether to process images.
     * @example true
     */
    shouldProcessImages: boolean;

    /**
     * Flag to indicate whether to process images using Tesseract.
     * @example true
     */
    shouldProcessImagesWithTesseract: boolean;

    /**
     * Directory containing input images.
     * @example "/path/to/input/images"
     */
    inputImagesDirectory: string;

    /**
     * Prompts for various operations.
     */
    prompts: {
        enhanceText: {
            /**
             * System prompt for enhancing text.
             * @example "Enhance the following text:"
             */
            system: string;

            /**
             * User prompt for enhancing text.
             * @example "Please enhance the text: "
             */
            user: string;
        },
        analyzeImage: {
            /**
             * System prompt for analyzing images.
             * @example "Analyze the following image:"
             */
            system: string;

            /**
             * User prompt for analyzing the previous page.
             * @example "Analyze the previous page: "
             */
            userPreviousPage: string;
        }
    };

    /**
     * Indexer to allow dynamic property access.
     */
    [key: string]: string | boolean | SecretString | object;

    constructor() {
        this.openaiApiKey = new SecretString("sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        this.openaiModel = "gpt-4";
        this.outputBaseDirectory = "/path/to/output";
        this.outputAudioSubDirectory = "audio";
        this.concatenatedAudioFile = "/path/to/output/audio/concatenated.mp3";
        this.shouldMergeAudioFiles = true;
        this.shouldConvertMarkdownToAudio = true;
        this.outputTextFileDirectory = "/path/to/output/text";
        this.outputRecognizedTextFile = "/path/to/output/recognized.txt";
        this.shouldProcessImages = true;
        this.shouldProcessImagesWithTesseract = true;
        this.shouldMergeTextFiles = true;
        this.inputImagesDirectory = "/path/to/input/images";
        this.prompts = {
            enhanceText: {
                system: "Enhance the following text:",
                user: "Please enhance the text: "
            },
            analyzeImage: {
                system: "Analyze the following image:",
                userPreviousPage: "Analyze the previous page: "
            }
        };
    }
}