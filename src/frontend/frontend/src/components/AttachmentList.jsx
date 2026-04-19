import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const AttachmentList = ({ attachments, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, fileId: null });

    const truncateFileName = (fileName) => {
        if (!fileName) return '';
        const lastDot = fileName.lastIndexOf('.');
        const extension = lastDot !== -1 ? fileName.slice(lastDot) : '';
        const nameWithoutExt = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
        if (nameWithoutExt.length <= 20) return fileName;
        const start = nameWithoutExt.slice(0, 15);
        const end = nameWithoutExt.slice(-5);
        return `${start}...${end}${extension}`;
    };

    const handleDeleteClick = (id) => setConfirmDelete({ isOpen: true, fileId: id });
    const handleConfirmDelete = async () => {
        const id = confirmDelete.fileId;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/files/${id}`, {
                method: 'DELETE',
                headers: { Authorization: token ? `Bearer ${token}` : '' },
            });
            if (response.ok) onDelete();
            else alert('Ошибка удаления');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Ошибка удаления');
        } finally {
            setConfirmDelete({ isOpen: false, fileId: null });
        }
    };
    const handleCancelDelete = () => setConfirmDelete({ isOpen: false, fileId: null });

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(0)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="attachments-list">
            <label className="form-label">Прикреплённые файлы</label>
            {attachments.length === 0 && <div className="attachments-empty">Нет файлов</div>}
            <ul>
                {attachments.map((att) => (
                    <li key={att.id} className="attachment-item">
                        <a
                            href={`/api/files/${att.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                        >
                            <i className="fas fa-paperclip"></i> {truncateFileName(att.fileName)}
                            <span className="attachment-tooltip">{att.fileName}</span>
                        </a>
                        <span className="attachment-size">{formatFileSize(att.fileSize)}</span>
                        <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => handleDeleteClick(att.id)}
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </li>
                ))}
            </ul>
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Удаление файла"
                message="Вы действительно хотите удалить этот файл? Это действие необратимо."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
};

export default AttachmentList;