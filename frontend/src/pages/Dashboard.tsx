import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle2, Clock, AlertCircle, LayoutList } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const updateTaskStatus = useUpdateTaskStatus();

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data.data
  });

  const { data: overdue } = useQuery({
    queryKey: ['dashboard', 'overdue'],
    queryFn: async () => (await api.get('/dashboard/overdue')).data.data
  });

  const { data: activity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => (await api.get('/dashboard/activity')).data.data
  });

  const { data: myTasks } = useTasks({ assignee: user?.id });

  const activeTasks = myTasks?.filter((t: any) => t.status !== 'Done') || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            <LayoutList className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats ? Object.values(stats).reduce((a: any, b: any) => a + b, 0) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.['In Progress'] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.Done || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdue?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.project.name} • <span className="text-primary-600 font-medium">{task.status}</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.due_date && (
                      <p className={`text-sm ${new Date(task.due_date) < new Date() ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        Due {format(new Date(task.due_date), 'MMM d')}
                      </p>
                    )}
                    <select
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={task.status}
                      onChange={(e) => updateTaskStatus.mutate({ id: task.id, status: e.target.value })}
                      disabled={updateTaskStatus.isPending && updateTaskStatus.variables?.id === task.id}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
              {activeTasks.length === 0 && <p className="text-sm text-gray-500">You have no active tasks. Great job!</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">Updated to <span className="font-medium text-gray-700">{task.status}</span> in {task.project.name}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(task.updated_at), 'MMM d, HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
