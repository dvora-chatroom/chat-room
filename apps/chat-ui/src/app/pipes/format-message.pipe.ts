import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatMessage',
  standalone: true
})
export class FormatMessagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(message: string): SafeHtml {
    if (!message) return '';

    let formattedMessage = message;
    
    // Handle code blocks (```)
    const codeBlocks: string[] = [];
    formattedMessage = formattedMessage.replace(/```([\s\S]*?)```/g, (match, code, offset, string) => {
      const language = this.detectLanguage(code);
      const cleanCode = this.removeLanguageFromFirstLine(code, language);
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      const escapedCode = this.escapeHtml(cleanCode);
      codeBlocks.push(`<div class="code-block" style="margin: 0.75rem 0; border-radius: 6px; overflow: hidden; background: #f8f9fa; border: 1px solid #e1e5e9; display: block; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"><div class="code-header" style="background: #f1f3f4; padding: 0.5rem 1rem; border-bottom: 1px solid #e1e5e9; display: flex; align-items: center;"><span class="language-label" style="font-size: 0.75rem; font-weight: 500; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px;">${language}</span></div><pre class="code-content" style="margin: 0; padding: 1rem; background: #f8f9fa; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.875rem; line-height: 1.6; color: #202124;"><code style="background: none; padding: 0; border: none; font-family: inherit; font-size: inherit; color: inherit;">${escapedCode}</code></pre></div>`);
      return placeholder;
    });

    // Clean up extra whitespace around code blocks
    formattedMessage = formattedMessage.replace(/\n\s*(__CODE_BLOCK_\d+__)\s*\n/g, '$1');

    // Handle inline code (`)
    formattedMessage = formattedMessage.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      formattedMessage = formattedMessage.replace(`__CODE_BLOCK_${index}__`, block);
    });

    // Wrap the result in a text-content span
    formattedMessage = `<span class="text-content">${formattedMessage}</span>`;

    return this.sanitizer.bypassSecurityTrustHtml(formattedMessage);
  }

  private detectLanguage(code: string): string {
    // Simple language detection based on common patterns
    const firstLine = code.trim().split('\n')[0].toLowerCase();
    
    if (firstLine.includes('typescript') || firstLine.includes('ts')) return 'typescript';
    if (firstLine.includes('javascript') || firstLine.includes('js')) return 'javascript';
    if (firstLine.includes('html')) return 'html';
    if (firstLine.includes('css')) return 'css';
    if (firstLine.includes('scss') || firstLine.includes('sass')) return 'scss';
    if (firstLine.includes('json')) return 'json';
    if (firstLine.includes('xml')) return 'xml';
    if (firstLine.includes('bash') || firstLine.includes('shell')) return 'bash';
    if (firstLine.includes('python') || firstLine.includes('py')) return 'python';
    if (firstLine.includes('java')) return 'java';
    if (firstLine.includes('c#') || firstLine.includes('csharp')) return 'csharp';
    
    // Default to typescript for Angular/TypeScript projects
    return '';
  }

  private removeLanguageFromFirstLine(code: string, language: string): string {
    const lines = code.split('\n');
    const firstLine = lines[0].trim().toLowerCase();
    if (firstLine === language.toLowerCase() ||
        firstLine === language.toLowerCase() + ' ' ||
        firstLine.includes(language.toLowerCase()) && firstLine.length <= language.length + 5) {
      return lines.slice(1).join('\n').trim();
    }
    return code;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
