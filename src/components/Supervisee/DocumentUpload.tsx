import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';

interface DocumentUploadProps {
  superviseeId: string;
}

export function DocumentUpload({ superviseeId }: DocumentUploadProps) {
  const { addDocument } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addDocument(superviseeId, {
      id: generateId(),
      name: name.trim() || 'Background Info',
      content: content.trim(),
      uploadedAt: new Date(),
    });

    setName('');
    setContent('');
    setIsOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const fileContent = await file.text();
      setName(file.name.replace('.txt', ''));
      setContent(fileContent);
    } else {
      alert('Please upload a .txt file.');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Document
      </button>
    );
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Upload .txt file
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        <div className="text-center text-xs text-gray-400">or enter manually</div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input text-sm"
          placeholder="Document title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea text-sm"
          rows={4}
          placeholder="Document content..."
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost text-sm">
            Cancel
          </button>
          <button type="submit" className="btn-primary text-sm" disabled={!content.trim()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
