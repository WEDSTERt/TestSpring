import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_USER_PROJECTS } from '../graphql/queries';
import { CREATE_PROJECT } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';

const ProjectsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectName, setProjectName] = useState('');

    const { loading, error, data, refetch } = useQuery(GET_USER_PROJECTS, {
        variables: { userId: user.id },
    });

    const [createProject] = useMutation(CREATE_PROJECT);

    useEffect(() => {
        if (showCreateModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showCreateModal]);

    if (loading) return <div>Загрузка проектов...</div>;
    if (error) return <div className="error">Ошибка: {error.message}</div>;

    const projectsMap = new Map();
    [...(data.owned || []), ...(data.member || [])].forEach((p) => projectsMap.set(p.id, p));
    const projects = Array.from(projectsMap.values());

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        try {
            await createProject({ variables: { name: projectName, ownerUserId: user.id } });
            setShowCreateModal(false);
            setProjectName('');
            refetch();
        } catch (err) {
            alert(`Ошибка создания: ${err.message}`);
        }
    };

    const handleOpenBoard = (id) => navigate(`/project/${id}/board`);

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        margin: 0,
        padding: 0,
    };
    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        minWidth: '320px',
        maxWidth: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 100000,
    };
    const Modal = () =>
        createPortal(
            <div style={modalOverlayStyle} onClick={() => setShowCreateModal(false)}>
                <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                    <h3>Новый проект</h3>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="form-group">
                            <label>Название проекта</label>
                            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} autoFocus required />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                            <button type="button" className="secondary" onClick={() => setShowCreateModal(false)}>Отмена</button>
                            <button type="submit">Создать</button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📂 Мои проекты</h2>
                <button onClick={() => setShowCreateModal(true)}>+ Создать проект</button>
            </div>
            {projects.length === 0 ? (
                <p>У вас пока нет проектов. Нажмите «Создать проект».</p>
            ) : (
                <div className="grid-2">
                    {projects.map((proj) => {
                        const isOwner = proj.owner.id === user.id;
                        const memberEntry = proj.members.find((m) => m.userId === user.id);
                        const role = memberEntry?.role || (isOwner ? 'OWNER' : 'MEMBER');
                        const canEdit = role === 'OWNER' || role === 'ADMIN';
                        return (
                            <div className="project-card" key={proj.id}>
                                <h3>{proj.name}</h3>
                                <p>👑 Владелец: {proj.owner.fullName}</p>
                                <p>👥 Участников: {proj.members.length}</p>
                                <div className="flex-row mt-4">
                                    <button className="small secondary" onClick={() => handleOpenBoard(proj.id)}>📌 Открыть доску</button>
                                    {canEdit && (
                                        <button className="small" onClick={() => navigate(`/project/${proj.id}/settings`)}>⚙️ Настройки</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {showCreateModal && <Modal />}
        </>
    );
};

export default ProjectsList;