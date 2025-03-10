import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Message } from '@/types/types';
import { exportAsMarkdown} from '@/lib/exportUtils';

interface ExportMenuProps {
  messages: Message[];
}

const ExportMenu: React.FC<ExportMenuProps> = ({ messages }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: 'markdown') => {
    setIsOpen(false);
    try {
      if (format === 'markdown') {
        exportAsMarkdown(messages);
      }
    } catch (error) {
      console.error('Error exporting chat:', error);
      alert('Failed to export chat. Please try again.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export Chat
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            <button
              onClick={() => handleExport('markdown')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as Markdown
            </button>
            {/* <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as PDF
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;