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
            let formattedDueDate = '';
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                if (!isNaN(date)) formattedDueDate = date.toISOString().split('T')[0];
            }
            setDueDate(formattedDueDate);
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
                    {/* Название */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-title">Название *</label>
                        <input
                            className="form-input"
                            type="text"
                            id="task-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Описание */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-desc">Описание</label>
                        <textarea
                            className="form-textarea"
                            id="task-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>

                    {/* Дедлайн */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-due">Дедлайн</label>
                        <input
                            className="form-input"
                            type="date"
                            id="task-due"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    {/* Статус */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-status">Статус</label>
                        <select
                            className="form-select"
                            id="task-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="TODO">Создано</option>
                            <option value="IN_PROGRESS">В разработке</option>
                            <option value="REVIEW">Выполнено</option>
                        </select>
                    </div>

                    {/* Важность */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-priority">Важность</label>
                        <select
                            className="form-select"
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="1">Низкая</option>
                            <option value="2">Средняя</option>
                            <option value="3">Высокая</option>
                        </select>
                    </div>

                    {/* Исполнители (чекбоксы) */}
                    <fieldset className="form-group">
                        <legend className="form-label">Исполнители (только участники текущей подгруппы)</legend>
                        <div className="assignees-checkbox-list">
                            {assignableUsers.map(member => (
                                <label key={member.userId} className="assignees-checkbox-label">
                                    <input
                                        type="checkbox"
                                        id={`assignee-${member.userId}`}
                                        name="assignees"
                                        checked={assigneeIds.includes(member.userId)}
                                        onChange={() => handleAssigneeToggle(member.userId)}
                                    />
                                    {member.user?.fullName || `Пользователь ${member.userId}`}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {/* Кнопки */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn--secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;