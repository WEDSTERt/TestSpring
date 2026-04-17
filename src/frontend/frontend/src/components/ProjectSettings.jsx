import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_DETAILS, GET_USER_PROJECTS, GET_USERS } from '../graphql/queries';
import {
    UPDATE_PROJECT,
    ADD_PROJECT_MEMBER,
    UPDATE_MEMBER_ROLE,
    REMOVE_MEMBER,
    DELETE_PROJECT,
} from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';

const ProjectSettings = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('MEMBER');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, memberId: null, isProject: false });

    const { loading, error, data, refetch } = useQuery(GET_PROJECT_DETAILS, {
        variables: { projectId },
    });
    const { data: usersData } = useQuery(GET_USERS, { variables: { limit: 100 } });

    const [updateProject] = useMutation(UPDATE_PROJECT);
    const [addMember] = useMutation(ADD_PROJECT_MEMBER);
    const [updateRole] = useMutation(UPDATE_MEMBER_ROLE);
    const [removeMember] = useMutation(REMOVE_MEMBER);
    const [deleteProject] = useMutation(DELETE_PROJECT, {
        onCompleted: () => {
            navigate('/');  // просто редирект, без alert
        },
        refetchQueries: [
            {
                query: GET_USER_PROJECTS,
                variables: { userId: user.id },
            },
        ],
    });

    if (loading) return <div>Загрузка настроек проекта...</div>;
    if (error) return <div className="error">{error.message}</div>;

    const project = data.project;
    const isOwner = project.owner.id === user.id;
    const currentMember = project.members.find((m) => m.userId === user.id);
    const canManage = isOwner || currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';
    if (!canManage) return <div className="error">У вас нет прав на управление этим проектом.</div>;

    const handleUpdateName = async () => {
        const newName = prompt('Введите новое название проекта', project.name);
        if (newName && newName.trim()) {
            try {
                await updateProject({ variables: { id: projectId, name: newName } });
                refetch();
                setMessage('Название обновлено');
                setIsError(false);
            } catch (err) { setMessage(err.message); setIsError(true); }
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await updateRole({ variables: { id: memberId, role: newRole } });
            refetch();
            setMessage('Роль обновлена');
            setIsError(false);
        } catch (err) { setMessage(err.message); setIsError(true); }
    };

    const handleRemoveMember = (memberId) => {
        setDeleteConfirm({ isOpen: true, memberId, isProject: false });
    };

    const confirmRemoveMember = async () => {
        await removeMember({ variables: { id: deleteConfirm.memberId } });
        refetch();
        setMessage('Участник удалён');
        setIsError(false);
        setDeleteConfirm({ isOpen: false, memberId: null, isProject: false });
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setSearchError('');
        if (!newMemberEmail.trim()) return;
        const allUsers = usersData?.users || [];
        const foundUser = allUsers.find(u => u.email.toLowerCase() === newMemberEmail.trim().toLowerCase());
        if (!foundUser) { setSearchError('Пользователь с таким email не найден'); return; }
        if (project.members.some(m => m.userId === foundUser.id)) { setSearchError('Пользователь уже является участником проекта'); return; }
        try {
            await addMember({ variables: { projectId, userId: foundUser.id, role: newMemberRole } });
            refetch();
            setNewMemberEmail('');
            setMessage('Участник добавлен');
            setIsError(false);
        } catch (err) { setMessage(err.message); setIsError(true); }
    };

    const handleDeleteProject = () => {
        setDeleteConfirm({ isOpen: true, isProject: true });
    };

    const confirmDeleteProject = async () => {
        await deleteProject({ variables: { id: projectId } });
        setDeleteConfirm({ isOpen: false, isProject: false });
    };

    return (
        <div style={{ position: 'relative' }}>
            <button className="close-settings" onClick={() => navigate('/')}>✕</button>
            <h2>⚙️ Настройки проекта</h2>
            <div className="card">
                <h3>📝 Основное</h3>
                <div className="form-group"><label>Название проекта</label><input type="text" value={project.name} readOnly /></div>
                <button className="secondary" onClick={handleUpdateName}>Изменить название</button>
                <div className="divider" />
                <h3>👥 Участники</h3>
                <div id="membersList">
                    {project.members.map((m) => (
                        <div key={m.id} className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                            <span><strong>{m.user.fullName}</strong> ({m.user.email}) <span className="role-badge">{m.role}</span></span>
                            <div>
                                <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)} className="small" style={{ width: 'auto' }}>
                                    <option value="ADMIN">Админ</option><option value="MEMBER">Участник</option><option value="VIEWER">Наблюдатель</option>
                                </select>
                                <button className="small danger" onClick={() => handleRemoveMember(m.id)} disabled={m.userId === project.owner.id}>Удалить</button>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddMember} className="mt-4">
                    <div className="form-group">
                        <label>Добавить участника по email</label>
                        <div className="flex-row">
                            <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email пользователя" style={{ flex: 2 }} />
                            <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} style={{ flex: 1 }}>
                                <option value="ADMIN">Админ</option><option value="MEMBER">Участник</option><option value="VIEWER">Наблюдатель</option>
                            </select>
                            <button type="submit">Добавить</button>
                        </div>
                        {searchError && <div className="error" style={{ marginTop: '8px' }}>{searchError}</div>}
                    </div>
                </form>
                <div className="divider" />
                <button className="danger" onClick={handleDeleteProject}>🗑️ Удалить проект</button>
                {message && <div className={`mt-4 ${isError ? 'error' : 'success'}`}>{message}</div>}
            </div>
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title={deleteConfirm.isProject ? "Удаление проекта" : "Удаление участника"}
                message={deleteConfirm.isProject
                    ? "Вы действительно хотите удалить проект? Все данные будут потеряны."
                    : "Вы действительно хотите удалить этого участника из проекта?"}
                onConfirm={deleteConfirm.isProject ? confirmDeleteProject : confirmRemoveMember}
                onCancel={() => setDeleteConfirm({ isOpen: false, memberId: null, isProject: false })}
            />
        </div>
    );
};

export default ProjectSettings;