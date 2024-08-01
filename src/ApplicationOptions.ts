import { injectable } from "tsyringe";

/**
 * Configuration options for the application.
 */
@injectable()
export class ApplicationOptions {
    /**
     * API key for accessing OpenAI services.
     * @example "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     */
    OPENAI_API_KEY!: string;

    /**
     * Model name to be used with OpenAI.
     * @example "gpt-4"
     */
    OPENAI_MODEL!: string;

    /**
     * Base directory for output files.
     * @example "/path/to/output"
     */
    outputBaseDirectory!: string;

    /**
     * Subdirectory for output audio files.
     * @example "audio"
     */
    outputAudioSubDirectory!: string;

    /**
     * Path to the concatenated audio file.
     * @example "/path/to/output/audio/concatenated.mp3"
     */
    concatenatedAudioFile!: string;

    /**
     * Flag to indicate whether to merge audio files.
     * @example true
     */
    shouldMergeAudioFiles!: boolean;

    /**
     * Flag to indicate whether to convert markdown to audio.
     * @example true
     */
    shouldConvertMarkdownToAudio!: boolean;

    /**
     * Path to the file where recognized text will be output.
     * @example "/path/to/output/recognized.txt"
     */
    outputRecognizedTextFile!: string;

    /**
     * Flag to indicate whether to process images.
     * @example true
     */
    shouldProcessImages!: boolean;

    /**
     * Flag to indicate whether to process images using Tesseract.
     * @example true
     */
    shouldProcessImagesWithTesseract!: boolean;

    /**
     * Directory containing input images.
     * @example "/path/to/input/images"
     */
    inputImagesDirectory!: string;

    /**
     * Prompts for various operations.
     */
    prompts?: {
        enhanceText: {
            /**
             * System prompt for enhancing text.
             * @example "Enhance the following text:"
             */
            system?: string;

            /**
             * User prompt for enhancing text.
             * @example "Please enhance the text: "
             */
            user?: string;
        },
        analyzeImage: {
            /**
             * System prompt for analyzing images.
             * @example "Analyze the following image:"
             */
            system?: string;

            /**
             * User prompt for analyzing the previous page.
             * @example "Analyze the previous page: "
             */
            userPreviousPage?: string;
        }
    };

    /**
     * Indexer to allow dynamic property access.
     */
    [key: string]: any;

    constructor(argv: any, config: any) {
        this.OPENAI_API_KEY = argv.OPENAI_API_KEY || config.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        this.OPENAI_MODEL = argv.OPENAI_MODEL || config.OPENAI_MODEL || process.env.OPENAI_MODEL;
        this.outputBaseDirectory = argv.outputBaseDir || config.outputBaseDir || process.env.OUTPUT_BASE_DIR;
        this.outputAudioSubDirectory = argv.outputAudioSubDir || config.outputAudioSubDir || process.env.OUTPUT_AUDIO_SUB_DIR;
        this.concatenatedAudioFile = argv.concattedAudioFile || config.concattedAudioFile || process.env.CONCATTED_AUDIO_FILE;
        this.shouldMergeAudioFiles = argv.mergeAudioFiles || config.mergeAudioFiles || process.env.MERGE_AUDIO_FILES;
        this.shouldConvertMarkdownToAudio = argv.convertMarkdownToAudio || config.convertMarkdownToAudio || process.env.CONVERT_MARKDOWN_TO_AUDIO;
        this.outputRecognizedTextFile = argv.outputRecognizedFile || config.outputRecognizedFile || process.env.OUTPUT_RECOGNIZED_FILE;
        this.shouldProcessImages = argv.processImages || config.processImages || process.env.PROCESS_IMAGES;
        this.shouldProcessImagesWithTesseract = argv.processImagesWithTesseract || config.processImagesWithTesseract || process.env.PROCESS_IMAGES_WITH_TESSERACT;
        this.inputImagesDirectory = argv.inputImagesDir || config.inputImagesDir || process.env.INPUT_IMAGES_DIR;
    }
}

