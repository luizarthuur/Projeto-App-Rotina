// src/components/dayModal/DayModal.tsx
import { useEffect, useState } from 'react';
import '../modal/modal.css';
import type { Task } from '../table/table';

function generateId(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36)}`;
}

interface DayModalProps {
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  date: string;
  hour: string;
  task?: Task | null;
  existingTasks: Task[];
}

export default function DayModal({
  onClose,
  onSaveTask,
  onDeleteTask,
  date,
  hour,
  task,
  existingTasks,
}: DayModalProps) {
  const [form, setForm] = useState({
    taskName: '',
    taskDescription: '',
    taskInitialTime: '',
    taskFinalTime: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        taskInitialTime: task.taskInitialTime,
        taskFinalTime: task.taskFinalTime,
      });
    } else {
      const [h, m] = hour.split(':');
      const nextHour = String(Number(h) + 1).padStart(2, '0');
      setForm({
        taskName: '',
        taskDescription: '',
        taskInitialTime: hour,
        taskFinalTime: `${nextHour}:${m}`,
      });
    }
  }, [task, hour]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  function checkConflict(start: string, end: string, currentId?: string): boolean {
    return existingTasks.some(t =>
      t.id !== currentId &&
      ((start >= t.taskInitialTime && start < t.taskFinalTime) ||
        (end > t.taskInitialTime && end <= t.taskFinalTime) ||
        (start <= t.taskInitialTime && end >= t.taskFinalTime))
    );
  }

  function handleSave() {
    if (!form.taskName.trim()) {
      setError('Nome da tarefa é obrigatório.');
      return;
    }
    if (form.taskInitialTime >= form.taskFinalTime) {
      setError('Horário final deve ser maior que o inicial.');
      return;
    }
    if (checkConflict(form.taskInitialTime, form.taskFinalTime, task?.id)) {
      setError('Conflito de horário com outra tarefa neste dia.');
      return;
    }

    const newTask: Task = {
      id: task?.id ?? generateId(),
      date,
      taskName: form.taskName.trim(),
      taskDescription: form.taskDescription.trim(),
      taskInitialTime: form.taskInitialTime,
      taskFinalTime: form.taskFinalTime,
    };
    onSaveTask(newTask);
    onClose();
  }

  function handleDelete() {
    if (task && window.confirm('Excluir tarefa?')) {
      onDeleteTask?.(task.id);
      onClose();
    }
  }

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Estrutura idêntica ao TemplateEditor (sem portal)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formattedDate}</h2>
        </div>
        <div className="modal-body">
          {task && (
            <div className="modal-preview">
              <p><strong>{task.taskName}</strong> – {task.taskInitialTime} às {task.taskFinalTime}</p>
              {task.taskDescription && <p>{task.taskDescription}</p>}
            </div>
          )}
          <div className="modal-fields">
            <input
              name="taskName"
              placeholder="Nome da tarefa"
              value={form.taskName}
              onChange={handleChange}
            />
            <input
              name="taskDescription"
              placeholder="Descrição (opcional)"
              value={form.taskDescription}
              onChange={handleChange}
            />
            <div className="modal-time-row">
              <input
                type="time"
                name="taskInitialTime"
                value={form.taskInitialTime}
                onChange={handleChange}
              />
              <span>até</span>
              <input
                type="time"
                name="taskFinalTime"
                value={form.taskFinalTime}
                onChange={handleChange}
              />
            </div>
            {error && <div className="modal-error">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-save" onClick={handleSave}>
            {task ? 'Salvar' : 'Adicionar'}
          </button>
          {task && onDeleteTask && (
            <button className="btn-delete" onClick={handleDelete}>
              Excluir
            </button>
          )}
          <button className="btn-cancel" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}