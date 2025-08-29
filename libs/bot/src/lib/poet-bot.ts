import OpenAI from 'openai';

/**
 * Configuration interface for PoetBot.
 */
export interface PoetBotConfig {
  /** OpenAI API key for AI functionality */
  openaiApiKey: string;
  /** AI model to use (default: 'gpt-4o-mini') */
  model?: string;
  /** Cooldown time in milliseconds (default: 10000) */
  cooldownMs?: number;
  /** Bot display name (default: 'PoetBot') */
  botName?: string;
  /** Bot unique identifier (default: 'poetbot') */
  botId?: string;
}

/**
 * AI-powered bot that provides poetic responses to technology questions.
 */
export class PoetBot {
  private openai: OpenAI | null;
  private cooldownUntil = 0;
  private cooldownMs: number;
  public botName: string;
  public botId: string;

  /**
   * Creates a new PoetBot instance.
   * @param config - Configuration options for the bot
   */
  constructor(config: PoetBotConfig) {
    this.openai = config.openaiApiKey ? new OpenAI({ apiKey: config.openaiApiKey }) : null;
    this.cooldownMs = config.cooldownMs || 10000;
    this.botName = config.botName || 'PoetBot';
    this.botId = config.botId || 'poetbot';
  }

  /**
   * Checks if the bot is currently on cooldown.
   * @returns True if the bot is on cooldown
   */
  isOnCooldown(): boolean {
    return Date.now() < this.cooldownUntil;
  }

  /**
   * Sets the bot on cooldown for the configured duration.
   */
  setCooldown(): void {
    this.cooldownUntil = Date.now() + this.cooldownMs;
  }

  /**
   * Classifies if a message is a technology question.
   * @param prompt - The message to classify
   * @returns True if tech question, false if not, null if classification failed
   */
  async classifyIsTechQuestion(prompt: string): Promise<boolean | null> {
    if (!this.openai) {
      console.warn('PoetBot: OPENAI_API_KEY not configured; skipping classification');
      return null;
    }
    try {
      console.log('PoetBot: classifying prompt with mini model');
      const response = await this.openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content:
              'Respond ONLY with the single word true or false (lowercase). Determine if the user asks a technology/software/web development question (Angular/TypeScript/JavaScript/HTML/CSS/RxJS/Nx, tooling, performance, frameworks, build, etc.). No extra text.'
          },
          { role: 'user', content: prompt }
        ] as any
      });
      const text = (response as any).output_text as string;
      const normalized = (text || '').trim().toLowerCase();
      console.log('PoetBot: classifier raw:', normalized);
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
      return null;
    } catch (e) {
      console.error('PoetBot classify error:', (e as any)?.message || e);
      return null;
    }
  }

  /**
   * Generates a poetic response to a technology question.
   * @param prompt - The question to answer
   * @returns Poetic response or null if generation failed
   */
  async generatePoeticAnswer(prompt: string): Promise<string | null> {
    if (!this.openai) return null;
    try {
      console.log('PoetBot: generating poetic answer');
      const response = await this.openai.responses.create({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `You are a poetic assistant who answers all questions in rhyme.
- Every line you write must rhyme naturally with the previous line, forming a flowing poem.
- You are an expert in frontend development, especially Angular v16+ (standalone components, modern APIs), TypeScript, and modern web technologies.
- Provide guidance, tips, and coding steps in Angular and TypeScript, all in rhyme.
- Include brief code blocks when needed, integrating them smoothly into your rhymes.
- Use creative, rhythmic phrasing while keeping explanations clear and technically accurate.
- Avoid dry, plain text; every sentence should contribute to the rhyme and rhythm.
- Keep a friendly, engaging tone, as if telling a story in verse.
- Ensure responses are under ~12 lines and maintain proper poetic flow.`
          },
          { role: 'user', content: prompt }
        ] as any,
        max_output_tokens: 500,
      });
      console.log('PoetBot: answer from openai:', response);
      const text = (response as any).output_text as string;
      return (text || '').trim() || null;
    } catch (e) {
      console.error('PoetBot answer error:', (e as any)?.message || e);
      return null;
    }
  }

  /**
   * Complete message processing pipeline.
   * @param message - The message to process
   * @returns Poetic response or null if no response should be sent
   */
  async processMessage(message: string): Promise<string | null> {
    if (this.isOnCooldown()) {
      return null;
    }

    console.log('PoetBot: trigger detected for message:', message);
    this.setCooldown();

    const isTech = await this.classifyIsTechQuestion(message);
    console.log('PoetBot: classifier result:', isTech);
    
    if (isTech === true) {
      const answer = await this.generatePoeticAnswer(message);
      if (answer) {
        return answer;
      } else {
        console.log('PoetBot: no answer generated');
      }
    } else {
      console.log('PoetBot: classifier indicated non-tech or uncertain');
    }

    return null;
  }


}
