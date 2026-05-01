import { useState } from 'react';
import { useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { Card } from '../components/ui/Card';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { GripVertical } from 'lucide-react';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

function SortableTaskItem({ task, updateTaskStatus }: { task: any, updateTaskStatus: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: task.project.color || '#e5e7eb' }}>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
            task.priority === 'High' ? 'bg-red-100 text-red-700' :
            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {task.priority}
          </span>
          <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-100 rounded">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <h4 className="text-sm font-medium text-gray-900 mb-1">{task.title}</h4>
        <p className="text-xs text-gray-500 mb-3">{task.project.name}</p>
        
        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex flex-wrap gap-1">
            {COLUMNS.map(col => (
              <button
                key={col}
                onClick={() => updateTaskStatus.mutate(
                  { id: task.id, status: col },
                  { onError: (err: any) => alert(err.response?.data?.error?.message || 'Failed to update status') }
                )}
                disabled={updateTaskStatus.isPending && updateTaskStatus.variables?.id === task.id}
                className={`text-[10px] px-2 py-1 rounded border font-medium transition-colors ${
                  task.status === col 
                    ? 'bg-primary-50 border-primary-200 text-primary-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            {task.due_date && (
              <span className={`text-[10px] font-medium ${new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'text-red-600' : 'text-gray-500'}`}>
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {task.assignee && (
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[10px]" title={task.assignee.name}>
                  {task.assignee.name[0].toUpperCase()}
                </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks({});
  const updateTaskStatus = useUpdateTaskStatus();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id;
    const overId = over.id;
    
    let column = COLUMNS.includes(overId as string) ? overId : tasks.find((t: any) => t.id === overId)?.status;
    
    const task = tasks.find((t: any) => t.id === taskId);
    if (task && column && task.status !== column) {
      updateTaskStatus.mutate({ id: taskId, status: column });
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(column => (
            <div key={column} className="flex-shrink-0 w-80 bg-gray-100/50 rounded-xl p-4 flex flex-col h-full border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">{column}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tasks?.filter((t: any) => t.status === column).length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px]" id={column}>
                <SortableContext items={tasks?.filter((t: any) => t.status === column).map((t: any) => t.id) || []} strategy={verticalListSortingStrategy}>
                  {tasks?.filter((t: any) => t.status === column).map((task: any) => (
                    <SortableTaskItem key={task.id} task={task} updateTaskStatus={updateTaskStatus} />
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
