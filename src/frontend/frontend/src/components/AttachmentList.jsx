import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const AttachmentList = ({ attachments, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, fileId: null });

    const handleDeleteClick = (id) => {
        setConfirmDelete({ isOpen: true, fileId: id });
    };

    const handleConfirmDelete = async () => {
        const id = confirmDelete.fileId;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/files/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            if (response.ok) {
                onDelete(); // обновляем список файлов
            } else {
                alert('Ошибка удаления');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Ошибка удаления');
        } finally {
            setConfirmDelete({ isOpen: false, fileId: null });
        }
    };

    const handleCancelDelete = () => {
        setConfirmDelete({ isOpen: false, fileId: null });
    };

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
                        <a href={`/api/files/${att.id}`} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-paperclip"></i> {att.fileName}
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