import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SUBGROUP } from '../graphql/mutations';

const CreateSubgroupModal = ({ projectId, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [createSubgroup, { loading }] = useMutation(CREATE_SUBGROUP, {
        onCompleted: () => {
            onCreated();
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        createSubgroup({ variables: { projectId, name } });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h3>Создать новую группу</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название группы</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" disabled={loading}>Создать</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSubgroupModal;