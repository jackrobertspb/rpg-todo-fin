import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import ProgressBar from '../components/ProgressBar';
import XPGainAnimation from '../components/XPGainAnimation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Tutorial from '../components/Tutorial';
import PlusIcon from '../components/icons/PlusIcon';
import LabelIcon from '../components/icons/LabelIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import ConfirmModal from '../components/ConfirmModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

export default function Dashboard() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [filterLabelIds, setFilterLabelIds] = useState([]);
  const [labels, setLabels] = useState([]);
  const [completingTaskIds, setCompletingTaskIds] = useState(new Set()); // Track tasks being completed
  const [xpGain, setXpGain] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { taskId, taskTitle }
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [deleteLabelConfirm, setDeleteLabelConfirm] = useState(null);

  // Debug logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard mounted, user:', user);
      console.log('Dashboard loading state:', loading);
    }
  }, [user, loading]);

  const checkTutorial = useCallback(() => {
    if (!user?.id) return;
    const tutorialKey = `tutorialCompleted_${user.id}`;
    const tutorialCompleted = localStorage.getItem(tutorialKey);
    if (tutorialCompleted === 'true') {
      setShowTutorial(false);
    } else {
      setShowTutorial(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User exists, calling fetchData');
      }
      fetchData();
      checkTutorial();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('No user, stopping loading');
      }
      // If no user, stop loading after a short delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, checkTutorial]); // fetchData is stable, only re-run when user ID changes

  // Safety timeout - if loading takes more than 3 seconds, stop loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Dashboard loading timeout - forcing stop after 3 seconds');
        setLoading(false);
      }, 3000); // Reduced to 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const fetchData = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('fetchData called, user:', user?.id);
    }
    try {
      setLoading(true);
      
      // Fetch all data in parallel instead of sequentially
      const [tasksRes, achievementsRes, labelsRes] = await Promise.allSettled([
        apiClient.get('/tasks', { params: { is_complete: false } }),
        apiClient.get('/achievements'),
        apiClient.get('/labels')
      ]);

      // Handle tasks
      if (tasksRes.status === 'fulfilled') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Tasks fetched:', tasksRes.value.data);
        }
        setTasks(tasksRes.value.data.tasks || []);
      } else {
        console.error('Error fetching tasks:', tasksRes.reason);
        setTasks([]);
      }

      // Handle achievements
      if (achievementsRes.status === 'fulfilled') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Achievements fetched:', achievementsRes.value.data);
        }
        setAchievements(achievementsRes.value.data.achievements || []);
      } else {
        console.error('Error fetching achievements:', achievementsRes.reason);
        setAchievements([]);
      }

      // Handle labels
      if (labelsRes.status === 'fulfilled') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Labels fetched:', labelsRes.value.data);
        }
        setLabels(labelsRes.value.data.labels || []);
      } else {
        console.error('Error fetching labels:', labelsRes.reason);
        setLabels([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (process.env.NODE_ENV === 'development') {
        console.log('fetchData complete, setting loading to false');
      }
      setLoading(false);
    }
  }, [user?.id]);

  const fetchLabels = useCallback(async () => {
    try {
      const labelsRes = await apiClient.get('/labels');
      setLabels(labelsRes.data.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  }, []);

  const handleTaskComplete = useCallback(async (taskId) => {
    // Prevent multiple clicks
    if (completingTaskIds.has(taskId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Task already being completed, ignoring duplicate click');
      }
      return;
    }

    // Optimistically update UI
    setCompletingTaskIds(prev => new Set(prev).add(taskId));
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, is_complete: true } : task
      )
    );

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Completing task:', taskId);
      }
      const response = await apiClient.post(`/tasks/${taskId}/complete`);
      if (process.env.NODE_ENV === 'development') {
        console.log('Task completed successfully:', response.data);
      }
      
      // Refresh achievements (tasks already updated optimistically)
      const { data: achievementsData } = await apiClient.get('/achievements');
      setAchievements(Array.isArray(achievementsData?.achievements) ? achievementsData.achievements : []);
      
      // Show achievement notifications if any earned
      if (response.data.new_achievements?.length > 0) {
        response.data.new_achievements.forEach(achievement => {
          toast.success(
            `Achievement Unlocked!\n${achievement.name}\n+${achievement.xp_bonus.toLocaleString()} XP`,
            {
              duration: 6000,
              icon: <TrophyIcon className="w-6 h-6" color="#f59e0b" />,
              style: {
                background: '#06b6d4',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
              },
            }
          );
        });
      }
      
      // Refresh user data through AuthContext
      await checkAuth();

      // Show XP animation
      if (response.data.xp_earned) {
        setXpGain(response.data.xp_earned);
        // Show success notification with XP earned
        toast.success(`Task completed! +${response.data.xp_earned.toLocaleString()} XP`, {
          duration: 3000,
        });
      }
      
      // Show toast for level up
      if (response.data.level_up) {
        toast.success(`🎉 Level Up! You're now Level ${response.data.new_level}!`, {
          duration: 4000,
          style: {
            background: '#22c55e',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, is_complete: false } : task
        )
      );
      toast.error(error.response?.data?.error || 'Failed to complete task. Please try again.');
    } finally {
      // Remove from completing set
      setCompletingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [completingTaskIds, fetchData]);

  const handleTaskCreate = useCallback(async (taskData) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating task:', taskData);
      }
      const response = await apiClient.post('/tasks', taskData);
      if (process.env.NODE_ENV === 'development') {
        console.log('Task created successfully:', response.data);
      }
      
      await fetchData();
      setShowTaskForm(false);
      setEditingTask(null);

      // Show success notification
      toast.success('Task created successfully!', {
        duration: 3000,
      });

      // Show achievement notifications if any earned
      if (response.data.new_achievements?.length > 0) {
        response.data.new_achievements.forEach(achievement => {
          toast.success(
            `Achievement Unlocked!\n${achievement.name}\n+${achievement.xp_bonus} XP`,
            {
              duration: 6000,
              icon: <TrophyIcon className="w-6 h-6" color="#f59e0b" />,
              style: {
                background: '#06b6d4',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
              },
            }
          );
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create task. Please try again.';
      toast.error(errorMessage);
      throw error; // Re-throw so TaskForm can handle it
    }
  }, [fetchData]);

  const handleTaskUpdate = useCallback(async (taskData) => {
    if (!editingTask) return;
    
    try {
      const response = await apiClient.put(`/tasks/${editingTask.id}`, taskData);
      await fetchData();
      setShowTaskForm(false);
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update task. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  }, [editingTask, fetchData]);

  const handleTaskEdit = useCallback((task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  const handleTaskDelete = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteConfirm({
      taskId,
      taskTitle: task?.title || 'this task'
    });
  }, [tasks]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    try {
      await apiClient.delete(`/tasks/${deleteConfirm.taskId}`);
      await fetchData();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.error || 'Failed to delete task. Please try again.');
    }
  }, [deleteConfirm, fetchData]);

  const handleFilterChange = useCallback((labelIds) => {
    setFilterLabelIds(labelIds);
  }, []);

  // Label management functions
  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Label name cannot be empty');
      return;
    }
    if (newLabelName.trim().length > 100) {
      toast.error('Label name must be 100 characters or less');
      return;
    }
    try {
      await apiClient.post('/labels', { name: newLabelName.trim() });
      setNewLabelName('');
      toast.success('Label created!');
      await fetchLabels();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create label');
    }
  };

  const handleEditLabel = async (labelId) => {
    if (!editLabelName.trim()) {
      toast.error('Label name cannot be empty');
      return;
    }
    if (editLabelName.trim().length > 100) {
      toast.error('Label name must be 100 characters or less');
      return;
    }
    try {
      await apiClient.put(`/labels/${labelId}`, { name: editLabelName.trim() });
      setEditingLabel(null);
      setEditLabelName('');
      toast.success('Label updated!');
      await fetchLabels();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update label');
    }
  };

  const handleDeleteLabel = (labelId) => {
    const label = labels.find(l => l.id === labelId);
    setDeleteLabelConfirm({
      labelId,
      labelName: label?.name || 'this label'
    });
  };

  const confirmDeleteLabel = async () => {
    if (!deleteLabelConfirm) return;

    try {
      await apiClient.delete(`/labels/${deleteLabelConfirm.labelId}`);
      toast.success('Label deleted!');
      await fetchLabels();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete label');
    }
  };

  const filteredTasks = useMemo(() => {
    if (filterLabelIds.length === 0) return tasks;
    return tasks.filter(task => {
      const taskLabelIds = task.task_labels?.map(tl => tl.label_id) || [];
      return filterLabelIds.some(id => taskLabelIds.includes(id));
    });
  }, [tasks, filterLabelIds]);

  // Sort by priority (High, Medium, Low)
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [filteredTasks]);

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen",
        "bg-white dark:bg-primary-dark"
      )}>
        <div className="container mx-auto px-4 py-8">
          <h1 className={cn(
            "text-3xl font-sans font-bold mb-6",
            "text-primary dark:text-white"
          )}>
            Dashboard
          </h1>
          
          {/* Profile Summary Skeleton */}
          <div className={cn(
            "mb-6 p-6 rounded-lg animate-pulse",
            "bg-primary dark:bg-primary-light",
            "h-32"
          )}></div>

          {/* Task List Skeleton */}
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg border animate-pulse",
              "bg-white dark:bg-primary",
              "border-primary dark:border-primary-light",
              "h-20"
            )}></div>
            <div className={cn(
              "p-4 rounded-lg border animate-pulse",
              "bg-white dark:bg-primary",
              "border-primary dark:border-primary-light",
              "h-20"
            )}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-white dark:bg-primary-dark"
      )}>
        <div className="text-center">
          <div className="text-xl font-sans text-primary dark:text-white mb-4">Please log in</div>
          <button
            onClick={() => navigate('/login')}
            className={cn(
              "px-6 py-2 rounded font-medium",
              "bg-secondary hover:bg-secondary-light",
              "text-white transition-colors"
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen",
      "bg-white dark:bg-primary-dark"
    )}>
      {showTutorial && (
        <Tutorial onComplete={() => {
          if (user?.id) {
            const tutorialKey = `tutorialCompleted_${user.id}`;
            localStorage.setItem(tutorialKey, 'true');
          }
          setShowTutorial(false);
        }} />
      )}
      {xpGain && (
        <XPGainAnimation
          amount={xpGain}
          level={user?.current_level || 1}
          onComplete={() => setXpGain(null)}
        />
      )}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteConfirm?.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <ConfirmModal
        isOpen={!!deleteLabelConfirm}
        onClose={() => setDeleteLabelConfirm(null)}
        onConfirm={confirmDeleteLabel}
        title="Delete Label?"
        message={`Are you sure you want to delete the label "${deleteLabelConfirm?.labelName}"? It will be removed from all tasks.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className={cn(
          "text-4xl font-sans font-bold mb-8",
          "text-primary dark:text-white"
        )}>
          Dashboard
        </h1>

        {/* Profile Summary */}
        <div className={cn(
          "mb-8 p-8 rounded-2xl shadow-lg",
          "bg-gradient-to-br from-primary to-primary-light dark:from-primary-light dark:to-primary",
          "text-white"
        )}>
          <h2 className="text-2xl font-sans font-bold mb-6">Your Progress</h2>
          <div className="mb-4">
            <ProgressBar
              currentXP={user?.total_xp || 0}
              currentLevel={user?.current_level || 1}
              whiteText={true}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Level</p>
              <p className="text-3xl font-bold">{user?.current_level || 1}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Total XP</p>
              <p className="text-3xl md:text-3xl text-2xl font-bold break-all">{(user?.total_xp || 0).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Tasks Complete</p>
              <p className="text-3xl font-bold">{tasks.filter(t => t.is_complete).length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Achievements</p>
              <p className="text-3xl font-bold">{Array.isArray(achievements) ? achievements.filter(a => a.earned).length : 0}/{Array.isArray(achievements) ? achievements.length : 0}</p>
            </div>
          </div>
        </div>

        {/* Task Creation */}
        <div className="mb-8">
          <Button
            onClick={() => {
              setShowTaskForm(!showTaskForm);
              setEditingTask(null);
            }}
            className={cn(
              "w-full md:w-auto flex items-center justify-center gap-2",
              "bg-secondary hover:bg-secondary-light text-white font-semibold py-6 px-8 text-lg"
            )}
          >
            <PlusIcon className="w-5 h-5" color="white" />
            {showTaskForm ? 'Cancel' : 'Create New Task'}
          </Button>

          {/* Quick Label Manager */}
          <button
            onClick={() => setShowLabelManager(!showLabelManager)}
            className="ml-4 text-sm text-secondary dark:text-secondary-light hover:underline"
          >
            {showLabelManager ? '− Hide Label Manager' : '+ Manage Labels'}
          </button>

          {showLabelManager && (
            <Card className="mt-4 p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary dark:text-white">Quick Label Manager</h3>
              
              {/* Create New Label */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-primary dark:text-white">
                    Create New Label
                  </label>
                  <span className={cn(
                    "text-xs",
                    newLabelName.length > 100 ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {newLabelName.length}/100 characters
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New label name..."
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
                    maxLength={100}
                    className={cn(
                      "flex-1 px-3 py-2 border rounded-md text-primary dark:text-white bg-white dark:bg-primary-light",
                      newLabelName.length > 100 ? "border-red-500" : "border-primary dark:border-secondary-light"
                    )}
                  />
                  <Button onClick={handleCreateLabel} variant="default">
                    Create
                  </Button>
                </div>
                {newLabelName.length > 100 && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    Label name must be 100 characters or less
                  </p>
                )}
              </div>

              {/* Existing Labels */}
              <div className="space-y-2">
                {labels.length > 0 ? (
                  labels.map((label) => (
                    <div key={label.id} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-primary-light">
                      {editingLabel === label.id ? (
                        <>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={editLabelName}
                              onChange={(e) => setEditLabelName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleEditLabel(label.id)}
                              maxLength={100}
                              className={cn(
                                "w-full px-2 py-1 border rounded text-sm text-primary dark:text-white bg-white dark:bg-primary",
                                editLabelName.length > 100 ? "border-red-500" : "border-primary dark:border-secondary-light"
                              )}
                              autoFocus
                            />
                            <div className="flex items-center justify-between mt-1">
                              <span className={cn(
                                "text-xs",
                                editLabelName.length > 100 ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                              )}>
                                {editLabelName.length}/100 characters
                              </span>
                              {editLabelName.length > 100 && (
                                <span className="text-xs text-red-500 dark:text-red-400">
                                  Label name must be 100 characters or less
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleEditLabel(label.id)}
                            variant="outline"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingLabel(null);
                              setEditLabelName('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <LabelIcon className="w-4 h-4 text-secondary dark:text-secondary-light" />
                          <span className="flex-1 text-sm text-primary dark:text-white">{label.name}</span>
                          <button
                            onClick={() => {
                              setEditingLabel(label.id);
                              setEditLabelName(label.name);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-primary rounded"
                          >
                            <EditIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteLabel(label.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <DeleteIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No labels yet. Create one above!
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {showTaskForm && (
          <TaskForm
            labels={labels}
            initialTask={editingTask}
            onSubmit={editingTask ? handleTaskUpdate : handleTaskCreate}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            onLabelsChange={fetchData}
          />
        )}

        {/* Task Filtering */}
        {labels.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-primary dark:text-white mb-3">
              Filter by Labels:
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filterLabelIds.length === 0 ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  filterLabelIds.length === 0 && "ring-2 ring-primary"
                )}
                onClick={() => handleFilterChange([])}
              >
                All Tasks
              </Badge>
              {labels.map((label) => (
                <Badge
                  key={label.id}
                  variant={filterLabelIds.includes(label.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    filterLabelIds.includes(label.id) && "ring-2 ring-primary",
                    "max-w-[150px] md:max-w-none"
                  )}
                  onClick={() => {
                    const newFilters = filterLabelIds.includes(label.id)
                      ? filterLabelIds.filter(id => id !== label.id)
                      : [...filterLabelIds, label.id];
                    handleFilterChange(newFilters);
                  }}
                >
                  <LabelIcon className="w-3 h-3 flex-shrink-0" color="currentColor" />
                  <span className="truncate">{label.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Prioritized Task List */}
        <div className="mb-8">
          <h2 className={cn(
            "text-3xl font-sans font-bold mb-6",
            "text-primary dark:text-white"
          )}>
            📋 Your Tasks
          </h2>
          {sortedTasks.length > 0 ? (
            <TaskList
              tasks={sortedTasks}
              onComplete={handleTaskComplete}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
              completingTaskIds={completingTaskIds}
            />
          ) : (
            <p className="text-primary dark:text-white">
              No tasks yet. Create your first task to get started!
            </p>
          )}
        </div>

        {/* Recent Achievements */}
        {achievements.filter(a => a.earned).length > 0 && (
          <div className={cn(
            "p-8 rounded-2xl shadow-lg",
            "bg-secondary dark:bg-secondary-dark",
            "text-white"
          )}>
            <h2 className="text-2xl font-sans font-bold mb-6">Recent Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {achievements.filter(a => a.earned).slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm font-medium">{achievement.name}</p>
                </div>
              ))}
            </div>
            {achievements.filter(a => a.earned).length > 4 && (
              <button
                onClick={() => navigate('/achievements')}
                className={cn(
                  "mt-6 text-sm underline",
                  "hover:text-secondary-light transition-colors"
                )}
              >
                View all achievements →
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


