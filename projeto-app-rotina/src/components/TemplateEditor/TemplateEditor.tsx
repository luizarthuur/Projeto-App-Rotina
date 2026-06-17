// src/components/templateEditor/TemplateEditor.tsx
import { useState, useEffect, useRef } from 'react';
import './TemplateEditor.css';
import '../modal/modal.css'; // importa o CSS compartilhado

const hours = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
  '19:00','20:00','21:00','22:00','23:00'
];

const days = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
  'Sexta-feira', 'Sábado', 'Domingo'
];

interface TemplateTask {
  id: string;
  day: string;
  taskName: string;
  taskDescription: string;
  taskInitialTime: string;
  taskFinalTime: string;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36)}`;
}

function isHourInRange(hour: string, start: string, end: string) {
  return hour >= start && hour < end;
}

export default function TemplateEditor() {
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const isFirstRender = useRef(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [editingTask, setEditingTask] = useState<TemplateTask | null>(null);
  const [form, setForm] = useState({
    taskName: '', taskDescription: '', startTime: '', endTime: ''
  });

  // Carregar template
  useEffect(() => {
    const stored = localStorage.getItem('weekly_template');
    if (stored) {
      try { setTasks(JSON.parse(stored)); } catch(e) {}
    }
  }, []);

  // Salvar template (pulando primeira execução)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('weekly_template', JSON.stringify(tasks));
  }, [tasks]);

  function openModal(day: string, hour: string, task?: TemplateTask) {
    setSelectedDay(day);
    setSelectedHour(hour);
    if (task) {
      setEditingTask(task);
      setForm({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        startTime: task.taskInitialTime,
        endTime: task.taskFinalTime,
      });
    } else {
      setEditingTask(null);
      const [h, m] = hour.split(':');
      const nextHour = String(Number(h) + 1).padStart(2, '0');
      setForm({
        taskName: '',
        taskDescription: '',
        startTime: hour,
        endTime: `${nextHour}:${m}`,
      });
    }
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditingTask(null); }

  function handleSave() {
    if (!form.taskName.trim()) {
      alert('Nome da tarefa é obrigatório');
      return;
    }
    if (form.startTime >= form.endTime) {
      alert('Horário final deve ser maior que o inicial');
      return;
    }

    const newTask: TemplateTask = {
      id: editingTask?.id ?? generateId(),
      day: selectedDay,
      taskName: form.taskName.trim(),
      taskDescription: form.taskDescription.trim(),
      taskInitialTime: form.startTime,
      taskFinalTime: form.endTime,
    };
    setTasks(prev => {
      if (editingTask) return prev.map(t => t.id === editingTask.id ? newTask : t);
      return [...prev, newTask];
    });
    closeModal();
  }

  function handleDelete(id: string) {
    if (window.confirm('Excluir esta tarefa do template?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      closeModal();
    }
  }

  return (
    <div className='templateeditor-container'>
      <div className='templateeditor-container-title'>
        <h2>Editor de Template Semanal</h2>
        <p>Monte sua rotina padrão (as alterações são salvas automaticamente) e carregue-as na tabela.</p>
      </div>

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="table-header-title">Horário</th>
              {days.map(day => (
                <th key={day} className="table-header-day">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="hour-cell">{hour}</td>
                {days.map(day => {
                  const task = tasks.find(t =>
                    t.day === day && isHourInRange(hour, t.taskInitialTime, t.taskFinalTime)
                  );
                  return (
                    <td
                      key={`${day}-${hour}`}
                      className={`day-cell ${task ? 'occupied' : ''}`}
                      onClick={() => openModal(day, hour, task)}
                    >
                      {task && (
                        <div className="task">
                          <strong>{task.taskName}</strong>
                          {task.taskDescription && (
                            <span className="task-description">{task.taskDescription}</span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDay} – {selectedHour}</h2>
            </div>
            <div className="modal-body">
              {editingTask && (
                <div className="modal-preview">
                  <p><strong>{editingTask.taskName}</strong> – {editingTask.taskInitialTime} às {editingTask.taskFinalTime}</p>
                  {editingTask.taskDescription && <p>{editingTask.taskDescription}</p>}
                </div>
              )}
              <div className="modal-fields">
                <input
                  type="text"
                  placeholder="Nome da tarefa"
                  value={form.taskName}
                  onChange={e => setForm({...form, taskName: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Descrição (opcional)"
                  value={form.taskDescription}
                  onChange={e => setForm({...form, taskDescription: e.target.value})}
                />
                <div className="modal-time-row">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm({...form, startTime: e.target.value})}
                  />
                  <span>até</span>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm({...form, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-save" onClick={handleSave}>
                {editingTask ? 'Salvar' : 'Adicionar'}
              </button>
              {editingTask && (
                <button className="btn-delete" onClick={() => handleDelete(editingTask.id)}>
                  Excluir
                </button>
              )}
              <button className="btn-cancel" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}