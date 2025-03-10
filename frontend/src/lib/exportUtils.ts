import { Message } from '@/types/types';

export const generateMarkdownContent = (messages: Message[]): string => {
  return messages.map(message => {
    const icon = message.role === 'user' ? '👤' : '🤖';
    const sender = message.role === 'user' ? 'You' : 'Assistant';
    return `${icon} **${sender}**: ${message.content}\n\n`;
  }).join('---\n\n');
};

export const exportAsMarkdown = (messages: Message[]) => {
  const content = generateMarkdownContent(messages);
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};