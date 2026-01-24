import { useState } from 'react';
import { Supervisee } from '../../types';
import { generateSynthesis } from '../../services/gemini';

interface SynthesisSectionProps {
  supervisee: Supervisee;
}

export function SynthesisSection({ supervisee }: SynthesisSectionProps) {
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (supervisee.notes.length === 0 && supervisee.documents.length === 0) {
      setError('Add some notes or documents first to generate a synthesis.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateSynthesis(supervisee);
      setSynthesis(result);
    } catch (err) {
      console.error('Failed to generate synthesis:', err);
      setError('Failed to generate synthesis. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInlineMarkdown = (text: string) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        return <hr key={i} className="my-4 border-gray-200" />;
      }
      // H2 headers
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-lg font-semibold text-gray-900 mt-6 mb-2">
            {renderInlineMarkdown(line.replace('## ', ''))}
          </h3>
        );
      }
      // H3 headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-2">
            {renderInlineMarkdown(line.replace('### ', ''))}
          </h4>
        );
      }
      // Bullet points with - or *
      if (line.match(/^[\-\*]\s/)) {
        return (
          <li key={i} className="text-gray-700 ml-4 mb-1 list-disc list-inside">
            {renderInlineMarkdown(line.replace(/^[\-\*]\s/, ''))}
          </li>
        );
      }
      // Numbered lists
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="text-gray-700 ml-4 mb-1 list-decimal list-inside">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      // Regular paragraphs
      return (
        <p key={i} className="text-gray-700 mb-2">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Coaching Synthesis</h2>
          <p className="text-sm text-gray-500">
            AI-generated summary based on notes and profile
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Summary
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {synthesis ? (
        <div className="card">
          <div className="prose prose-sm max-w-none">{renderMarkdown(synthesis)}</div>
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No synthesis generated yet</p>
          <p className="text-sm mt-1">
            Click "Generate Summary" to create an AI-powered coaching synthesis
          </p>
        </div>
      )}
    </div>
  );
}
