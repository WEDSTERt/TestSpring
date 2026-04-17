import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_USER_PROJECTS } from '../graphql/queries';
import { useAuth } from '../contexts/AuthContext';

const ProjectsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_USER_PROJECTS, {
        variables: { userId: user.id },
    });

    if (loading) return <div>Загрузка проектов...</div>;
    if (error) return <div className="error">Ошибка: {error.message}</div>;

    const projectsMap = new Map();
    [...(data.owned || []), ...(data.member || [])].forEach((p) =>
        projectsMap.set(p.id, p)
    );
    const projects = Array.from(projectsMap.values());

    if (projects.length === 0) return <p>У вас пока нет проектов.</p>;

    const handleOpenBoard = (id) =>
        alert(`Открытие доски проекта ${id} (функционал будет позже)`);

    return (
        <>
            <h2>📂 Мои проекты</h2>
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
                                <button
                                    className="small secondary"
                                    onClick={() => handleOpenBoard(proj.id)}
                                >
                                    📌 Открыть доску
                                </button>
                                {canEdit && (
                                    <button
                                        className="small"
                                        onClick={() => navigate(`/project/${proj.id}/settings`)}
                                    >
                                        ⚙️ Настройки
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default ProjectsList;