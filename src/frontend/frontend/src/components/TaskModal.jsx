import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, subgroupId, assignableUsers, initialAssigneeIds, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('TODO');
    const [priority, setPriority] = useState(2);
    const [assigneeIds, setAssigneeIds] = useState([]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setDueDate(task.dueDate || '');
            let rawStatus = task.status;
            if (typeof rawStatus === 'number') {
                rawStatus = rawStatus === 0 ? 'TODO' : rawStatus === 1 ? 'IN_PROGRESS' : 'REVIEW';
            } else if (typeof rawStatus === 'string') {
                rawStatus = rawStatus.toUpperCase();
                if (rawStatus === 'INPROGRESS') rawStatus = 'IN_PROGRESS';
            }
            setStatus(rawStatus === 'TODO' || rawStatus === 'IN_PROGRESS' || rawStatus === 'REVIEW' ? rawStatus : 'TODO');
            setPriority(task.value || 2);
            setAssigneeIds(task.assignees?.map(a => a.id) || []);
        } else {
            setTitle('');
            setDescription('');
            setDueDate('');
            setStatus('TODO');
            setPriority(2);
            setAssigneeIds(initialAssigneeIds || []);
        }
    }, [task, initialAssigneeIds]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Введите название задачи');
            return;
        }
        onSave({
            title: title.trim(),
            description: description.trim() || null,
            dueDate: dueDate || null,
            status,
            value: parseInt(priority),
            assigneeIds,
        });
    };

    const handleAssigneeToggle = (userId) => {
        setAssigneeIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h3>{task ? 'Редактировать задачу' : 'Новая задача'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Описание</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
                    </div>
                    <div className="form-group">
                        <label>Дедлайн</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Статус</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="TODO">Создано</option>
                            <option value="IN_PROGRESS">В разработке</option>
                            <option value="REVIEW">Выполнено</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Важность</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="1">Низкая</option>
                            <option value="2">Средняя</option>
                            <option value="3">Высокая</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Исполнители (только участники текущей подгруппы)</label>
                        <div className="assignees-checkbox-list">
                            {assignableUsers.map(member => (
                                <label key={member.userId} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={assigneeIds.includes(member.userId)}
                                        onChange={() => handleAssigneeToggle(member.userId)}
                                    />
                                    {member.user?.fullName || `Пользователь ${member.userId}`}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="secondary" onClick={onClose}>Отмена</button>
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;