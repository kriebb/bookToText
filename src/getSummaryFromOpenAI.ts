import OpenAI from "openai";



import { MessageDTO } from './MessageDTO';
import { injectable } from "tsyringe";

@injectable()
export class OpenAISummarizer {
  constructor(private apiKey: string, private prompt: string) {
    if (apiKey == null || apiKey == "")
      throw new Error("apiKey cannot be null or empty");
    if (prompt == null || prompt == "")
      throw new Error("prompt cannot be null or empty");
  }
  getSummary = async (messages: MessageDTO[], maxTokens = 4095): Promise<string> => {
    return this.summarize(messages.map(m => m.fromPushName + ":" + m.content), maxTokens);
  }
  summarize = async (messages: string[], maxTokens = 4095): Promise<string> => {
    try {
      const openai = new OpenAI({
        apiKey: this.apiKey,
      });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.prompt
          },
          {
            role: "user",
            content: "these are the messages:" + messages.join("\n")
          }
        ],
        temperature: 1,
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const summary = response.choices[0].message.content?.trim();
      return summary ?? "no answer from openai";

    } catch (error) {
      console.error("Error calling OpenAI to get summary:", error);
      throw error;
    }
  }

  summarizeMessages = async (messages: string[]) => {
    let summaries = [];
    let chunk = [];
    let tokenCount = 0;

    for (const message of messages) {
      const messageTokenEstimate = this.estimateTokens(message);
      if (tokenCount + messageTokenEstimate > 4095) {
        // Summarize the current chunk
        const summary = await this.summarize(chunk);
        summaries.push(summary);
        chunk = []; // Reset for next chunk
        tokenCount = 0;
      }
      chunk.push(message);
      tokenCount += messageTokenEstimate;
    }

    // Summarize any remaining messages
    if (chunk.length > 0) {
      const summary = await this.summarize(chunk);
      summaries.push(summary);
    }

    // Summarize summaries if needed
    if (summaries.length > 1) {
      const allSummaries = summaries.join("\n");
      if (this.estimateTokens(allSummaries) > 1000) {
        // Summarize the summaries to fit within 1000 tokens
        return await this.summarize(summaries, 1000);
      }
      return allSummaries;
    }

    return summaries.join("\n");
  }

  estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);

  }
}


