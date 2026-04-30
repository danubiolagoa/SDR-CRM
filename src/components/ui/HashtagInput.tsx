import { useRef } from 'react';

interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
}

export function HashtagInput({ value, onChange, placeholder, rows = 4, label, hint }: HashtagInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlightText = (text: string) => {
    // Divide o texto pelas hashtags preservando elas
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="bg-indigo-100 text-indigo-700 px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{highlightText(value)}</p>
        </div>
      )}
    </div>
  );
}
