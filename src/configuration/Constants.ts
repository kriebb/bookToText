export const MESSAGES = {
  noSystemPromptEnhanceText: 'No system prompt provided for enhancing text. Skipping enhancing',
  noUserPromptEnhanceText: 'No user prompt provided for enhancing text. Skipping enhancing',
  maxTokensZero: 'Max tokens is 0. Skipping enhancing',
  errorOpenAiApiCall: 'Error during OpenAI API call:',
  imagesProcessedUsingOpenAi: 'Images processed using openAI',
  imagesProcessedUsingTesseract: 'Images processed using Tesseract',
  enhancementComplete: 'Enhanced sections written to ',
  noSystemPromptAnalyzeImage: 'No system prompt provided for analyzing image. Skipping analysis',
  noUserPreviousPagePrompt: 'No user previous page prompt provided for analyzing image. Skipping analysis',
  tesseractAnalysisSkip: 'Skipping {imageFile} for tesseract analysis as it already exists in the output directory',
  fileExistsSkip: 'Skipping {imageFile} as it already exists in the output directory',
  nonTiffFileSkip: 'Skipping {imageFile} as it is not a tiff file',
  processingImages: 'Processing images using OpenAI',
  notProcessingImagesWithOpenAI: 'Not processing images with OpenAI',
  processingImagesWithTesseract: 'Processing images using Tesseract',
  notProcessingImagesWithTesseract: 'Not processing images with Tesseract',
  convertingMarkdownToAudio: 'Converting markdown to audio',
  notConvertingMarkdownToAudio: 'Not converting markdown to audio',
  mergingAudioFiles: 'Merging audio files',
  notMergingAudioFiles: 'Not merging audio files',
  errorMarkdownToAudioConversion: 'Error during markdown to audio conversion:',
  errorMergingAudioFiles: 'Error during merging audio files:'
};
export const TTS_MODEL = 'tts-1';
export const TTS_VOICE = 'alloy';
export const TTS_RESPONSE_FORMAT = 'mp3';
export const MAX_TOKENS_BUFFER = 1000;
export const HEADER_CONTENT_TYPE = 'application/json';

export const FILE_EXTENSIONS = {
  tesseractOCR: '.tesseract.ocr.md',
  markdownXHTML: '.md.xhtml',
  jpg: '.jpg',
  mp3: '.mp3',
  tiff: '.tiff',
  tif: '.tif',
  md: '.md'
};

export const REMOVE_BOLD_REGEX = /(?:\*\*|__)(.*?)(?:\*\*|__)/g;
export const REMOVE_ITALICS_REGEX = /(?:\*|_)(.*?)(?:\*|_)/g;
export const REMOVE_LINE_BREAKS_REGEX = /(?:\r\n|\r|\n)/g;
export const COLLAPSE_SPACES_REGEX = /\s+/g;

export const SENTENCE_REGEX = /[^\.!\?]+[\.!\?]+/g;

export const MAX_OPENAI_MODEL_LENGTH = 4095;

export const CONFIG_FILE_LOCATION = './config.json';
export const VARIABLE_MAPPING_FILE_LOCATION = './config.variablemapping.json';