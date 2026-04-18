import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_DETAILS } from '../graphql/queries';
import { GET_TASKS_BY_SUBGROUP, GET_TASKS_BY_ASSIGNEE } from '../graphql/queries';
import { UPDATE_TASK, DELETE_TASK, CREATE_TASK, SET_TASK_ASSIGNEES } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import SubgroupsPanel from './SubgroupsPanel';
import TaskModal from './TaskModal';
import ConfirmModal from './ConfirmModal';

const KanbanBoard = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeSubgroupId, setActiveSubgroupId] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, taskId: null });
    const [initialAssigneeIds, setInitialAssigneeIds] = useState([]);

    const { loading: projectLoading, data: projectData, refetch: refetchProject } = useQuery(GET_PROJECT_DETAILS, { variables: { projectId } });
    const { loading: tasksLoading, data: tasksData, refetch: refetchTasks } = useQuery(GET_TASKS_BY_SUBGROUP, {
        variables: { subgroupId: activeSubgroupId },
        skip: !activeSubgroupId || activeSubgroupId === 'my-tasks',
    });
    const { loading: myTasksLoading, data: myTasksData, refetch: refetchMyTasks } = useQuery(GET_TASKS_BY_ASSIGNEE, {
        variables: { userId: user.id },
        skip: activeSubgroupId !== 'my-tasks',
    });

    const [createTask] = useMutation(CREATE_TASK);
    const [updateTask] = useMutation(UPDATE_TASK);
    const [deleteTask] = useMutation(DELETE_TASK);
    const [setTaskAssignees] = useMutation(SET_TASK_ASSIGNEES);

    const refetchCurrentTasks = () => {
        if (activeSubgroupId === 'my-tasks') refetchMyTasks();
        else if (activeSubgroupId) refetchTasks();
    };

    const visibleSubgroups = useMemo(() => {
        if (!projectData?.project) return [];
        const realSubgroups = projectData.project.subgroups || [];
        const projectMembers = projectData.project.members || [];
        const isOwner = projectData.project.owner.id === user.id;
        const currentMember = projectMembers.find(m => m.userId === user.id);
        const isAdmin = isOwner || currentMember?.role === 'ADMIN';
        if (isOwner || isAdmin) return realSubgroups;
        return realSubgroups.filter(group => group.members?.some(m => m.userId === user.id));
    }, [projectData, user.id]);

    useEffect(() => {
        if (activeSubgroupId === null) setActiveSubgroupId('my-tasks');
    }, []);

    if (projectLoading) return <div className="loading">Загрузка проекта...</div>;
    if (!projectData?.project) return <div className="message-error">Проект не найден</div>;

    const project = projectData.project;
    const isOwner = project.owner.id === user.id;
    const currentMember = project.members.find(m => m.userId === user.id);
    const canEditProject = isOwner || currentMember?.role === 'ADMIN';
    const realSubgroups = project.subgroups || [];
    const projectMembers = project.members || [];

    let tasks = [];
    if (activeSubgroupId === 'my-tasks') {
        const allTasks = myTasksData?.tasksByAssignee || [];
        const currentSubgroupIds = new Set(realSubgroups.map(g => g.id));
        tasks = allTasks.filter(task => currentSubgroupIds.has(task.subgroupId));
    } else if (activeSubgroupId) {
        tasks = tasksData?.tasksBySubgroup || [];
    }

    const normalizeStatus = (status) => {
        if (status === undefined || status === null) return 'TODO';
        if (typeof status === 'number') {
            if (status === 0) return 'TODO';
            if (status === 1) return 'IN_PROGRESS';
            if (status === 2) return 'REVIEW';
            return 'TODO';
        }
        const upper = String(status).toUpperCase();
        if (upper === 'TODO') return 'TODO';
        if (upper === 'IN_PROGRESS' || upper === 'INPROGRESS') return 'IN_PROGRESS';
        if (upper === 'REVIEW') return 'REVIEW';
        return 'TODO';
    };

    const sortByDueDate = (a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    };

    const statusLabels = { TODO: '📝 Создано', IN_PROGRESS: '⚡ В разработке', REVIEW: '✅ Выполнено' };
    const statusColors = { TODO: '#3b82f6', IN_PROGRESS: '#f59e0b', REVIEW: '#10b981' };

    const tasksByStatus = {
        TODO: tasks.filter(t => normalizeStatus(t.status) === 'TODO').sort(sortByDueDate),
        IN_PROGRESS: tasks.filter(t => normalizeStatus(t.status) === 'IN_PROGRESS').sort(sortByDueDate),
        REVIEW: tasks.filter(t => normalizeStatus(t.status) === 'REVIEW').sort(sortByDueDate),
    };

    let targetSubgroupForAssign = null;
    if (activeSubgroupId && activeSubgroupId !== 'my-tasks') {
        targetSubgroupForAssign = realSubgroups.find(g => g.id === activeSubgroupId);
    } else if (activeSubgroupId === 'my-tasks' && realSubgroups.length > 0) {
        targetSubgroupForAssign = realSubgroups[0];
    }
    const assignableUsers = targetSubgroupForAssign?.members || [];

    const handleCreateTask = () => {
        if (!activeSubgroupId) {
            alert('Сначала выберите группу');
            return;
        }
        setEditingTask(null);
        let ids = [];
        if (activeSubgroupId === 'my-tasks') {
            ids = [user.id];
        } else {
            const targetGroup = realSubgroups.find(g => g.id === activeSubgroupId);
            if (targetGroup && targetGroup.members) {
                ids = targetGroup.members.filter(m => m.role === 'LEADER').map(m => m.userId);
            }
        }
        setInitialAssigneeIds(ids);
        setShowTaskModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowTaskModal(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            const formattedDueDate = taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null;
            if (editingTask) {
                await updateTask({
                    variables: {
                        id: editingTask.id,
                        title: taskData.title,
                        description: taskData.description || null,
                        dueDate: formattedDueDate,
                        value: taskData.value,
                        status: taskData.status,
                    },
                });
                if (taskData.assigneeIds) {
                    await setTaskAssignees({ variables: { taskId: editingTask.id, userIds: taskData.assigneeIds } });
                }
            } else {
                let targetSubgroupId = activeSubgroupId;
                let assigneeIds = taskData.assigneeIds || [];
                if (activeSubgroupId === 'my-tasks') {
                    if (realSubgroups.length === 0) {
                        alert('Сначала создайте хотя бы одну группу в проекте');
                        return;
                    }
                    targetSubgroupId = realSubgroups[0].id;
                    if (!assigneeIds.includes(user.id)) assigneeIds.push(user.id);
                }
                await createTask({
                    variables: {
                        subgroupId: targetSubgroupId,
                        createdByUserId: user.id,
                        title: taskData.title,
                        description: taskData.description || null,
                        dueDate: formattedDueDate,
                        value: taskData.value || 0,
                        status: taskData.status || 'TODO',
                        assigneeIds,
                    },
                });
            }
            await refetchCurrentTasks();
            if (activeSubgroupId !== 'my-tasks') await refetchMyTasks();
            setShowTaskModal(false);
        } catch (err) {
            console.error('Ошибка сохранения задачи:', err);
            alert('Ошибка: ' + err.message);
        }
    };

    const handleDeleteTask = (taskId) => setDeleteConfirm({ isOpen: true, taskId });
    const confirmDeleteTask = async () => {
        await deleteTask({ variables: { id: deleteConfirm.taskId } });
        refetchCurrentTasks();
        if (activeSubgroupId !== 'my-tasks') refetchMyTasks();
        setDeleteConfirm({ isOpen: false, taskId: null });
    };

    const handleDragStart = (e, taskId, fromStatus) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('fromStatus', fromStatus);
    };
    const handleDrop = async (e, toStatus) => {
        const taskId = e.dataTransfer.getData('taskId');
        const fromStatus = e.dataTransfer.getData('fromStatus');
        if (fromStatus === toStatus) return;
        await updateTask({ variables: { id: taskId, status: toStatus } });
        refetchCurrentTasks();
        if (activeSubgroupId !== 'my-tasks') refetchMyTasks();
    };
    const handleDragOver = (e) => e.preventDefault();

    const isLoading = (activeSubgroupId === 'my-tasks') ? myTasksLoading : tasksLoading;

    return (
        <div className="kanban-layout">
            <SubgroupsPanel
                projectId={projectId}
                activeSubgroupId={activeSubgroupId}
                onSelectSubgroup={setActiveSubgroupId}
                isOwner={isOwner}
                projectMembers={projectMembers}
                onRefreshProject={refetchProject}
            />
            <div className="kanban-container">
                <div className="kanban-header">
                    <div className="kanban-title-area">
                        <h2 className="kanban-title">{project.name}</h2>
                        <button className="btn" onClick={handleCreateTask}>+ Новая задача</button>
                    </div>
                    {canEditProject && (
                        <button className="btn btn--secondary" onClick={() => navigate(`/project/${projectId}/settings`)}>⚙️ Настройки проекта</button>
                    )}
                </div>
                {isLoading && <div className="loading">Загрузка задач...</div>}
                {activeSubgroupId && (
                    <div className="kanban-board">
                        {['TODO', 'IN_PROGRESS', 'REVIEW'].map((status) => (
                            <div key={status} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
                                <div className="kanban-column-header">
                                    <h3 style={{ borderLeftColor: statusColors[status] }}>{statusLabels[status]}</h3>
                                    <span className="kanban-task-count">{tasksByStatus[status].length}</span>
                                </div>
                                <div className="kanban-task-list">
                                    {tasksByStatus[status].map((task) => (
                                        <div key={task.id} className="task-card" draggable onDragStart={(e) => handleDragStart(e, task.id, status)} onClick={() => handleEditTask(task)}>
                                            <div className="task-title">{task.title}</div>
                                            <div className="task-meta" />
                                            <div className="task-bottom-row">
                                                <div className={`task-priority priority-${task.value || 2}`}>
                                                    {task.value === 1 && '🔵 Низкая'}
                                                    {task.value === 2 && '🟡 Средняя'}
                                                    {task.value === 3 && '🔴 Высокая'}
                                                    {!task.value && '🟡 Средняя'}
                                                </div>
                                                {task.dueDate && <div className="task-date">📅 {new Date(task.dueDate).toLocaleDateString()}</div>}
                                            </div>
                                            <div className="task-assignees">
                                                {task.assignees?.map(a => <span key={a.id}>{a.fullName}</span>)}
                                            </div>
                                            <button className="task-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showTaskModal && (
                <TaskModal
                    task={editingTask}
                    subgroupId={activeSubgroupId}
                    assignableUsers={assignableUsers}
                    initialAssigneeIds={initialAssigneeIds}
                    onSave={handleSaveTask}
                    onClose={() => setShowTaskModal(false)}
                />
            )}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Удаление задачи"
                message="Вы действительно хотите удалить эту задачу? Это действие необратимо."
                onConfirm={confirmDeleteTask}
                onCancel={() => setDeleteConfirm({ isOpen: false, taskId: null })}
            />
        </div>
    );
};

export default KanbanBoard;