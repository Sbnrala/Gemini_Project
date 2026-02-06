
import React, { useState } from 'react';
import { DriveFile } from '../types';

interface GoogleDrivePickerProps {
  onClose: () => void;
  onSelect: (files: DriveFile[]) => void;
}

const MOCK_DRIVE_FILES: DriveFile[] = [
  { id: 'df1', name: 'Basement_Layout_Specs.pdf', type: 'pdf', size: '2.4 MB', modified: 'Oct 12, 2023' },
  { id: 'df2', name: 'Project_Budget_Estimates', type: 'sheet', size: '156 KB', modified: 'Yesterday' },
  { id: 'df3', name: 'Contractor_Agreement_V2.docx', type: 'doc', size: '45 KB', modified: '2 hours ago' },
  { id: 'df4', name: 'Site_Photos_External', type: 'folder', modified: 'Aug 5, 2023' },
  { id: 'df5', name: 'Electrical_Schematics', type: 'folder', modified: 'Just now' },
];

export const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({ onClose, onSelect }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    const selectedFiles = MOCK_DRIVE_FILES.filter(f => selectedIds.has(f.id));
    onSelect(selectedFiles);
  };

  const FileIcon = ({ type }: { type: DriveFile['type'] }) => {
    switch (type) {
      case 'pdf': return <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold text-[10px]">PDF</div>;
      case 'sheet': return <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center font-bold text-[10px]">XLS</div>;
      case 'doc': return <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">DOC</div>;
      case 'folder': return <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[600px]">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-6 h-6" alt="Drive" />
            <h3 className="font-bold text-slate-800">Select Files from Google Drive</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="flex items-center gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">
            <div className="w-8"></div>
            <div className="flex-1">Name</div>
            <div className="w-24">Last Modified</div>
            <div className="w-16">Size</div>
          </div>
          {MOCK_DRIVE_FILES.map(file => (
            <button
              key={file.id}
              onClick={() => toggleSelect(file.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${selectedIds.has(file.id) ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'}`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.has(file.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                {selectedIds.has(file.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <FileIcon type={file.type} />
              <div className="flex-1 text-left font-semibold text-sm text-slate-700">{file.name}</div>
              <div className="w-24 text-left text-xs text-slate-400 font-medium">{file.modified}</div>
              <div className="w-16 text-left text-xs text-slate-400 font-medium">{file.size || '--'}</div>
            </button>
          ))}
        </div>

        <footer className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedIds.size} Items Selected</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 font-bold text-sm">Cancel</button>
            <button
              disabled={selectedIds.size === 0}
              onClick={handleConfirm}
              className="bg-indigo-600 disabled:bg-slate-300 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
            >
              Add to Context
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
