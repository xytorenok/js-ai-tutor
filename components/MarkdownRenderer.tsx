import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple parser to split by ``` code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Remove the backticks and optional language identifier
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          const code = match ? match[2] : part.slice(3, -3);
          
          return (
            <div key={index} className="my-3 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-sm">
              <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5 border-b border-gray-700">
                <span className="text-xs font-mono text-gray-400">javascript</span>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-400 font-mono text-xs md:text-sm">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Handle inline code `like this`
          const textParts = part.split(/(`[^`]+`)/g);
          return (
            <span key={index}>
              {textParts.map((subPart, subIndex) => {
                if (subPart.startsWith('`') && subPart.endsWith('`')) {
                  return (
                    <code key={subIndex} className="mx-1 px-1.5 py-0.5 rounded bg-gray-700 text-emerald-300 font-mono text-xs md:text-sm">
                      {subPart.slice(1, -1)}
                    </code>
                  );
                }
                // Handle bold
                const boldParts = subPart.split(/(\*\*[^*]+\*\*)/g);
                 return (
                    <span key={subIndex}>
                        {boldParts.map((bPart, bIndex) => {
                             if (bPart.startsWith('**') && bPart.endsWith('**')) {
                                return <strong key={bIndex} className="font-bold text-white">{bPart.slice(2, -2)}</strong>
                             }
                             return <span key={bIndex} className="whitespace-pre-wrap">{bPart}</span>
                        })}
                    </span>
                 )
              })}
            </span>
          );
        }
      })}
    </div>
  );
};