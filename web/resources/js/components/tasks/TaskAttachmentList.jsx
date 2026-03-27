import React, { useRef, useState } from 'react';
import { fileSizeLabel } from '../../utils/taskHelpers';

export default function TaskAttachmentList({ attachments, canUpload, onUpload }) {
    const fileRef               = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const fd = new FormData();
        files.forEach(f => fd.append('files[]', f));
        setUploading(true);
        try { await onUpload(fd); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const fileIcon = (type) => {
        if (!type) return '📄';
        if (type.includes('pdf'))   return '📕';
        if (type.includes('image')) return '🖼️';
        if (type.includes('sheet') || type.includes('excel')) return '📗';
        if (type.includes('word'))  return '📘';
        return '📄';
    };

    return (
        <div>
            {/* File list */}
            <div className="space-y-2">
                {attachments?.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 bg-[#F8F8FC] rounded-lg border border-[#F0F0F8]">
                        <span className="text-lg">{fileIcon(a.file_type)}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#1A1A2E] truncate">{a.file_name}</p>
                            <p className="text-[10px] text-[#A0A0C0]">{fileSizeLabel(a.file_size)}</p>
                        </div>
                        {a.download_url && (
                            <a
                                href={a.download_url}
                                download
                                className="text-[#5B5BD6] hover:text-[#4747B8] text-xs font-medium flex-shrink-0"
                            >
                                ↓
                            </a>
                        )}
                    </div>
                ))}
                {(!attachments || attachments.length === 0) && (
                    <p className="text-xs text-[#A0A0C0] italic">No attachments yet.</p>
                )}
            </div>

            {/* Upload button */}
            {canUpload && (
                <div className="mt-3">
                    <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 text-xs text-[#5B5BD6] font-medium hover:underline disabled:opacity-50"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {uploading ? 'Uploading…' : 'Upload file'}
                    </button>
                </div>
            )}
        </div>
    );
}
