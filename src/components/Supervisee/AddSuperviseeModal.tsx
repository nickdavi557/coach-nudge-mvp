import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Document } from '../../types';
import { generateId } from '../../utils/helpers';

interface AddSuperviseeModalProps {
  onClose: () => void;
}

export function AddSuperviseeModal({ onClose }: AddSuperviseeModalProps) {
  const { addSupervisee } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const documents: Document[] = [];
    if (documentContent.trim()) {
      documents.push({
        id: generateId(),
        name: documentName.trim() || 'Background Info',
        content: documentContent.trim(),
        uploadedAt: new Date(),
      });
    }

    const supervisee = addSupervisee(name.trim(), documents);
    onClose();
    navigate(`/supervisee/${supervisee.id}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const content = await file.text();
      setDocumentName(file.name.replace('.txt', ''));
      setDocumentContent(content);
    } else {
      alert('Please upload a .txt file. Other formats are not supported in this demo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Supervisee</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter supervisee name"
              autoFocus
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Document (optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Add coaching preferences, personality info, or development goals
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Upload .txt file
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              <div className="text-center text-xs text-gray-400">or enter manually</div>

              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="input text-sm"
                placeholder="Document title (e.g., Coaching Preferences)"
              />
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="textarea text-sm"
                rows={4}
                placeholder="Enter background information..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Add Supervisee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
