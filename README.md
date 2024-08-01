# Book to AudioBook
This project is designed to provide a comprehensive set of tools for text extraction, image processing, Markdown rendering, and natural language processing. It leverages various powerful libraries and APIs to deliver these functionalities in a modular and configurable manner.


## Table of Contents

## Table of Contents

- [Introduction](#introduction)
  - [Key Features](#key-features)
    - [Text Extraction from Images](#text-extraction-from-images)
    - [Image Processing](#image-processing)
    - [Text To Speech (TTS)](#text-to-speech-tts)
    - [Markdown Rendering](#markdown-rendering)
    - [Natural Language Processing](#natural-language-processing)
    - [File Management](#file-management)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
    - [Windows](#windows)
    - [macOS](#macos)
    - [Linux](#linux)
    - [Calibre](#calibre)
  - [Installation](#installation)
- [Usage](#usage)
  - [Text Extraction](#text-extraction)
  - [Image Processing](#image-processing)
  - [Text To Speech](#text-to-speech)
  - [Markdown Rendering](#markdown-rendering)
  - [Natural Language Processing](#natural-language-processing)
  - [File Management](#file-management)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Disclaimer](#disclaimer)
- [Contact](#contact)

## Introduction

This project serves as a learning platform for Node.js, OpenAI, text extraction, and Text-to-Speech (TTS) technologies. It explores both traditional methods and modern AI-powered solutions, including:

- **OpenAI Chat and Copilot Chat**: Testing the capabilities of AI-driven development and assistance.
- **Tesseract.js**: Using Optical Character Recognition (OCR) for text extraction from images.
- **Windows SDK Speech-to-Text**: Traditional method for converting speech to text using Calibre Plugin TextToSpeech Plugin for now.
- **OpenAI Variants**: Leveraging OpenAI's models for text extraction and TTS.

### Key Features


1. **Text Extraction from Images**:
   - Extract text from images using 
     - Optical Character Recognition (OCR) powered by Tesseract.js.
     - OpenAI GPT model as an alternative.

2. **Image Processing**:
   - Process images, including format conversion, using the Sharp library.

3. **Text To Speech (TTS)**:
    - Using OpenAI TTS Whisper model to convert a big markdown file to one or more mp3 files.

4. **Markdown Rendering**:
   - Render Markdown content into HTML using MarkdownIt.

5. **Natural Language Processing**:
   - Utilize OpenAI's API for tasks such as text generation, summarization, and more.

6. **File Management**:
   - Manage files within specified directories, including reading, writing, and organizing files using `fs` and `fs-extra`.

### Prerequisites

#### Windows
Using [Chocolatey](https://chocolatey.org/):
```bash
choco install nodejs
choco install ffmpeg
```

#### macOS
Using [Homebrew](https://brew.sh/):
```bash
brew install node
brew install ffmpeg
```

#### Linux
Using the package manager for your distribution:

- **Debian/Ubuntu**:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  sudo apt install ffmpeg
  ```

- **Fedora**:
  ```bash
  sudo dnf install nodejs npm
  sudo dnf install ffmpeg
  ```

- **Arch Linux**:
  ```bash
  sudo pacman -S nodejs npm
  sudo pacman -S ffmpeg
  ```
#### Calibre
- [Calibre eBook Management Software](https://calibre-ebook.com/)
- [TTS Plugin](https://www.mobileread.com/forums/showthread.php?t=272674)

Install the TTS Plugin in Calibre:
- Open Calibre.
- Go to "Preferences" > "Plugins".
- Click on "Get new plugins" and search for a TTS plugin (e.g., "Text to Speech").
- Install the plugin and restart Calibre if necessary.


### Getting Started

To get started with this project, follow these steps:

1. **Clone the Repository**:
   ```sh
   git clone <repository-url>
   ```

2. **Install Dependencies**:
```bash
npm install
```

3. **Set Up Environment Variables**:

- Create a .env file in the root directory and add the necessary environment variables. For example:
```txt
OPENAI_API_KEY=your_openai_api_key
```

4. **Run the Application**:
```bash
npm start
```

5. **Create an ebook**
Create an eBook from the Generated Files
- Open Calibre.
- Click on "Add books" and select your output.md file.
- Once the file is added, select it and click on "Convert books".
- In the conversion window, set the input format to "Markdown" and the output format to your desired eBook format (e.g., EPUB or MOBI).
- Click "OK" to start the conversion.

6. **Use Windows Text To Speech**
Convert the eBook to MP3 Using TTS
- Open Calibre and select your converted eBook.
- Go to the TTS plugin options in the menu bar.
- Select the option to convert the eBook to MP3.
- Follow the prompts to complete the conversion.


## Project Structure
- .\src: Folder: Contains the source code of the application.
- .\dist: Folder: Contains compiled code of the application
- .\config.json: File: Configuration files and environment settings.
- .\package.json: File: NodeJs file that will contain dependenies, devdependenies, build and run commands
- .\tsconfig.json: File: Typescript configuration and compilation info

## Dependencies
- `tsyringe`: For dependency injection.
- `fs-extra`: For enhanced file system operations.
- `tesseract.js`: For OCR capabilities.
- `sharp`: For image processing.
- `openai`: For integrating with OpenAI's API.
- `markdown-it`: For Markdown parsing and rendering.
- `dotenv`: For loading environment variables.
- `child_process`: For executing shell commands.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
Thanks to the developers of the libraries and APIs used in this project for their excellent work.
Thanks to Xebia XMS Belgium that allows me to figure this out and sponsers me in the usage of OpenAI an Azure OpenAI

## Disclaimer

The author of this project is not responsible for any copyright material that is used or broken through the use of this software. All actions taken using this software are done at the user's own responsibility and accountability. Users must ensure that they have the legal right to use any content processed by this application. The author disclaims any liability for any damages or legal issues that may arise from the misuse of this software.

## Contact

If you have any questions, suggestions, or feedback, feel free to reach out to me through the following channels:

- **Email**: githubprojects.2024 `at` kriebbels `dot` me
- **GitHub**: [kriebb](https://github.com/kriebb)
- **Website**: [https://dotnet.kriebbels.me](https://dotnet.kriebbels.me)

I look forward to hearing from you!