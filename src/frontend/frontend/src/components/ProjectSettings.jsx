import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_DETAILS } from '../graphql/queries';
import {
    UPDATE_PROJECT,
    ADD_PROJECT_MEMBER,
    UPDATE_MEMBER_ROLE,
    REMOVE_MEMBER,
    DELETE_PROJECT,
} from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';

const ProjectSettings = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newMemberId, setNewMemberId] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('MEMBER');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const { loading, error, data, refetch } = useQuery(GET_PROJECT_DETAILS, {
        variables: { projectId },
    });

    const [updateProject] = useMutation(UPDATE_PROJECT);
    const [addMember] = useMutation(ADD_PROJECT_MEMBER);
    const [updateRole] = useMutation(UPDATE_MEMBER_ROLE);
    const [removeMember] = useMutation(REMOVE_MEMBER);
    const [deleteProject] = useMutation(DELETE_PROJECT, {
        onCompleted: () => {
            alert('Проект удалён');
            navigate('/');
        },
    });

    if (loading) return <div>Загрузка настроек проекта...</div>;
    if (error) return <div className="error">{error.message}</div>;

    const project = data.project;
    const isOwner = project.owner.id === user.id;
    const currentMember = project.members.find((m) => m.userId === user.id);
    const canManage =
        isOwner || currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';

    if (!canManage) {
        return <div className="error">У вас нет прав на управление этим проектом.</div>;
    }

    const handleUpdateName = async () => {
        const newName = prompt('Введите новое название проекта', project.name);
        if (newName && newName.trim()) {
            try {
                await updateProject({ variables: { id: projectId, name: newName } });
                refetch();
                setMessage('Название обновлено');
                setIsError(false);
            } catch (err) {
                setMessage(err.message);
                setIsError(true);
            }
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await updateRole({ variables: { id: memberId, role: newRole } });
            refetch();
            setMessage('Роль обновлена');
            setIsError(false);
        } catch (err) {
            setMessage(err.message);
            setIsError(true);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Удалить участника?')) return;
        try {
            await removeMember({ variables: { id: memberId } });
            refetch();
            setMessage('Участник удалён');
            setIsError(false);
        } catch (err) {
            setMessage(err.message);
            setIsError(true);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberId.trim()) return;
        try {
            await addMember({
                variables: { projectId, userId: newMemberId, role: newMemberRole },
            });
            refetch();
            setNewMemberId('');
            setMessage('Участник добавлен');
            setIsError(false);
        } catch (err) {
            setMessage(err.message);
            setIsError(true);
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Удалить проект навсегда? Это действие необратимо.')) return;
        try {
            await deleteProject({ variables: { id: projectId } });
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    return (
        <div>
            <h2>⚙️ Настройки проекта</h2>
            <div className="card">
                <h3>📝 Основное</h3>
                <div className="form-group">
                    <label>Название проекта</label>
                    <input type="text" value={project.name} readOnly />
                </div>
                <button className="secondary" onClick={handleUpdateName}>
                    Изменить название
                </button>

                <div className="divider" />

                <h3>👥 Участники</h3>
                <div id="membersList">
                    {project.members.map((m) => (
                        <div
                            key={m.id}
                            className="flex-row"
                            style={{ justifyContent: 'space-between', marginBottom: 12 }}
                        >
              <span>
                <strong>{m.user.fullName}</strong> ({m.user.email}){' '}
                  <span className="role-badge">{m.role}</span>
              </span>
                            <div>
                                <select
                                    value={m.role}
                                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                    className="small"
                                    style={{ width: 'auto' }}
                                >
                                    <option value="ADMIN">Админ</option>
                                    <option value="MEMBER">Участник</option>
                                    <option value="VIEWER">Наблюдатель</option>
                                </select>
                                <button
                                    className="small danger"
                                    onClick={() => handleRemoveMember(m.id)}
                                    disabled={m.userId === project.owner.id}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddMember} className="mt-4">
                    <div className="form-group">
                        <label>Добавить участника (по ID пользователя)</label>
                        <div className="flex-row">
                            <input
                                type="text"
                                value={newMemberId}
                                onChange={(e) => setNewMemberId(e.target.value)}
                                placeholder="ID пользователя"
                                style={{ flex: 2 }}
                            />
                            <select
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="ADMIN">Админ</option>
                                <option value="MEMBER">Участник</option>
                                <option value="VIEWER">Наблюдатель</option>
                            </select>
                            <button type="submit">Добавить</button>
                        </div>
                    </div>
                </form>

                <div className="divider" />

                <button className="danger" onClick={handleDeleteProject}>
                    🗑️ Удалить проект
                </button>

                {message && (
                    <div className={`mt-4 ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSettings;