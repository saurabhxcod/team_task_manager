import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useAddMember, useDeleteProject } from '../hooks/useProjects';
import { useCreateTask } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id as string);
  const addMember = useAddMember();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memberError, setMemberError] = useState('');

  if (isLoading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  const isAdmin = project.members.some((m: any) => m.user.id === user?.id && m.role === 'ADMIN');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setMemberError('');
      await addMember.mutateAsync({ projectId: id as string, email, role: 'MEMBER' });
      setEmail('');
    } catch (err: any) {
      setMemberError(err.response?.data?.error?.message || 'Failed to add member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await createTask.mutateAsync({ 
      title: taskTitle, 
      project_id: id as string,
      assignee_id: assigneeId || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null
    });
    setTaskTitle('');
    setAssigneeId('');
    setDueDate('');
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    await deleteProject.mutateAsync(id as string);
    navigate('/projects');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 mt-2">{project.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {project.status}
          </div>
          <Button variant="danger" onClick={handleDeleteProject} isLoading={deleteProject.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tasks ({project._count.tasks})</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <form onSubmit={handleCreateTask} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-3">
                  <Input 
                    value={taskTitle} 
                    onChange={(e) => setTaskTitle(e.target.value)} 
                    placeholder="New Task Title..." 
                  />
                  <div className="flex gap-3 items-center">
                    <select
                      className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {project.members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                    
                    <input
                      type="date"
                      className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />

                    <Button type="submit" isLoading={createTask.isPending}>Add Task</Button>
                  </div>
                </div>
              </form>
            )}
            <p className="text-gray-500 text-sm">Task list for this project. Navigate to Tasks board to see all tasks.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <form onSubmit={handleAddMember} className="mb-6 space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="User Email" 
                    type="email"
                    className="flex-1"
                  />
                  <Button type="submit" isLoading={addMember.isPending}>Invite</Button>
                </div>
                {memberError && <p className="text-red-500 text-xs">{memberError}</p>}
              </form>
            )}

            <div className="space-y-4">
              {project.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                      {member.user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${member.role === 'ADMIN' ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
