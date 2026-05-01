import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../components/ui/Input';

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = async () => {
    if (!newProjectName) return;
    await createProject.mutateAsync({ name: newProjectName, color: '#0ea5e9' });
    setNewProjectName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-4 flex gap-4 items-end">
            <div className="flex-1">
              <Input 
                label="Project Name" 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)} 
                placeholder="e.g. Website Redesign"
              />
            </div>
            <Button onClick={handleCreate} isLoading={createProject.isPending}>Create</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-t-4" style={{ borderTopColor: project.color || '#e5e7eb' }}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{project._count.tasks} Tasks</span>
                    <span>{project._count.members} Members</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
