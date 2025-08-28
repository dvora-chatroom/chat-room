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

    // First, handle code blocks (```)
    let formattedMessage = message;
    
    // Replace code blocks with placeholders
    const codeBlocks: string[] = [];
    formattedMessage = formattedMessage.replace(/```([\s\S]*?)```/g, (match, code) => {
      const language = this.detectLanguage(code);
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<div class="code-block">
        <div class="code-header">
          <span class="language-label">${language}</span>
        </div>
        <pre class="code-content"><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
      </div>`);
      return placeholder;
    });

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
    return 'typescript';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
