// dayModal.tsx
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import './dayModal.css';
import type { Task } from '../table/table';

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
      // Sugere horário final = hora clicada + 1h
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
    return existingTasks.some(
      (t) =>
        t.id !== currentId &&
        ((start >= t.taskInitialTime && start < t.taskFinalTime) ||
          (end > t.taskInitialTime && end <= t.taskFinalTime) ||
          (start <= t.taskInitialTime && end >= t.taskFinalTime))
    );
  }

  function handleSave() {
    if (!form.taskName.trim()) {
      setError('O nome da tarefa é obrigatório.');
      return;
    }
    if (form.taskInitialTime >= form.taskFinalTime) {
      setError('O horário final deve ser maior que o inicial.');
      return;
    }
    const hasConflict = checkConflict(
      form.taskInitialTime,
      form.taskFinalTime,
      task?.id
    );
    if (hasConflict) {
      setError('Conflito de horário com outra tarefa neste dia.');
      return;
    }

    const newTask: Task = {
      id: task?.id ?? crypto.randomUUID(),
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
    if (task && window.confirm('Excluir esta tarefa permanentemente?')) {
      onDeleteTask?.(task.id);
      onClose();
    }
  }

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content">
          <h1 className="modal-content-title">{formattedDate}</h1>

          {task && (
            <div className="modal-content-task-preview">
              <div className="modal-content-task-preview-container">
                <h1 className="modal-content-task-preview-title">Título:</h1>
                <p>{task.taskName}</p>
              </div>
              <div className="modal-content-task-preview-container">
                <h1 className="modal-content-task-preview-title">Descrição:</h1>
                <p>{task.taskDescription || '—'}</p>
              </div>
              <div className="modal-content-task-preview-container">
                <h1 className="modal-content-task-preview-title">Horário:</h1>
                <p>
                  {task.taskInitialTime} – {task.taskFinalTime}
                </p>
              </div>
            </div>
          )}

          <div className="modal-content-info">
            <input
              type="text"
              name="taskName"
              placeholder="Nome da tarefa"
              value={form.taskName}
              onChange={handleChange}
              className="modal-input"
            />
            <input
              type="text"
              name="taskDescription"
              placeholder="Descrição (opcional)"
              value={form.taskDescription}
              onChange={handleChange}
              className="modal-input"
            />
            <div className="time-row">
              <input
                type="time"
                name="taskInitialTime"
                value={form.taskInitialTime}
                onChange={handleChange}
                className="modal-input-time"
              />
              <span>até</span>
              <input
                type="time"
                name="taskFinalTime"
                value={form.taskFinalTime}
                onChange={handleChange}
                className="modal-input-time"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-content-button-container">
              <button className="btn-save" onClick={handleSave}>
                {task ? 'Salvar alterações' : 'Adicionar tarefa'}
              </button>
              {task && onDeleteTask && (
                <button className="btn-delete" onClick={handleDelete}>
                  Excluir
                </button>
              )}
              <button className="btn-close" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}