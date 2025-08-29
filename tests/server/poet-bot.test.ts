import { PoetBot, PoetBotConfig } from '../../libs/bot/src/lib/poet-bot';

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    responses: {
      create: mockCreate
    }
  }))
}));

// Mock console methods to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

  describe('PoetBot', () => {
    let poetBot: PoetBot;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockClear();
    
    const config: PoetBotConfig = {
      openaiApiKey: 'test-api-key',
      cooldownMs: 1000,
      botName: 'TestBot',
      botId: 'testbot'
    };
    
    poetBot = new PoetBot(config);
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const bot = new PoetBot({ openaiApiKey: 'test' });
      
      expect(bot.botName).toBe('PoetBot');
      expect(bot.botId).toBe('poetbot');
    });

    it('should initialize with custom values', () => {
      const config: PoetBotConfig = {
        openaiApiKey: 'test',
        botName: 'CustomBot',
        botId: 'custombot',
        cooldownMs: 5000
      };
      
      const bot = new PoetBot(config);
      expect(bot.botName).toBe('CustomBot');
      expect(bot.botId).toBe('custombot');
    });

    it('should handle missing API key', () => {
      const bot = new PoetBot({ openaiApiKey: '' });
      expect(bot.botName).toBe('PoetBot');
    });
  });

  describe('Cooldown System', () => {
    it('should not be on cooldown initially', () => {
      expect(poetBot.isOnCooldown()).toBe(false);
    });

    it('should be on cooldown after setting cooldown', () => {
      poetBot.setCooldown();
      expect(poetBot.isOnCooldown()).toBe(true);
    });

    it('should respect cooldown duration', async () => {
      poetBot.setCooldown();
      expect(poetBot.isOnCooldown()).toBe(true);
      
      // Wait for cooldown to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(poetBot.isOnCooldown()).toBe(false);
    });
  });

  describe('classifyIsTechQuestion', () => {
    it('should return true for tech questions', async () => {
      mockCreate.mockResolvedValue({
        output_text: 'true'
      });

      const result = await poetBot.classifyIsTechQuestion('How do I use Angular?');
      expect(result).toBe(true);
    });

    it('should return false for non-tech questions', async () => {
      mockCreate.mockResolvedValue({
        output_text: 'false'
      });

      const result = await poetBot.classifyIsTechQuestion('What is the weather like?');
      expect(result).toBe(false);
    });

    it('should return null for invalid responses', async () => {
      mockCreate.mockResolvedValue({
        output_text: 'maybe'
      });

      const result = await poetBot.classifyIsTechQuestion('Some question');
      expect(result).toBe(null);
    });

    it('should return null when API key is missing', async () => {
      const bot = new PoetBot({ openaiApiKey: '' });
      const result = await bot.classifyIsTechQuestion('How do I use Angular?');
      expect(result).toBe(null);
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const result = await poetBot.classifyIsTechQuestion('How do I use Angular?');
      expect(result).toBe(null);
    });
  });

  describe('generatePoeticAnswer', () => {
    it('should generate poetic response', async () => {
      const mockResponse = 'In Angular land, we craft with care,\nComponents everywhere!';
      mockCreate.mockResolvedValue({
        output_text: mockResponse
      });

      const result = await poetBot.generatePoeticAnswer('How do I create an Angular component?');
      expect(result).toBe(mockResponse);
    });

    it('should return null when API key is missing', async () => {
      const bot = new PoetBot({ openaiApiKey: '' });
      const result = await bot.generatePoeticAnswer('How do I use Angular?');
      expect(result).toBe(null);
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const result = await poetBot.generatePoeticAnswer('How do I use Angular?');
      expect(result).toBe(null);
    });

    it('should handle empty response', async () => {
      mockCreate.mockResolvedValue({
        output_text: ''
      });

      const result = await poetBot.generatePoeticAnswer('How do I use Angular?');
      expect(result).toBe(null);
    });
  });

  describe('processMessage', () => {
    it('should return null when on cooldown', async () => {
      poetBot.setCooldown();
      
      const result = await poetBot.processMessage('How do I use Angular?');
      expect(result).toBe(null);
    });

    it('should process tech questions and return response', async () => {
      mockCreate
        .mockResolvedValueOnce({ output_text: 'true' }) // Classification
        .mockResolvedValueOnce({ output_text: 'Poetic response here!' }); // Generation

      const result = await poetBot.processMessage('How do I create an Angular component?');
      expect(result).toBe('Poetic response here!');
    });

    it('should not process non-tech questions', async () => {
      mockCreate.mockResolvedValue({
        output_text: 'false'
      });

      const result = await poetBot.processMessage('What is the weather like?');
      expect(result).toBe(null);
    });

    it('should handle classification failure', async () => {
      mockCreate.mockResolvedValue({
        output_text: 'maybe'
      });

      const result = await poetBot.processMessage('Some question');
      expect(result).toBe(null);
    });

    it('should handle generation failure', async () => {
      mockCreate
        .mockResolvedValueOnce({ output_text: 'true' }) // Classification succeeds
        .mockRejectedValueOnce(new Error('Generation failed')); // Generation fails

      const result = await poetBot.processMessage('How do I use Angular?');
      expect(result).toBe(null);
    });
  });
});
