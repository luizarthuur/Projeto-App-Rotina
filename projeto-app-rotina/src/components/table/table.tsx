// Table.tsx
import './table.css';
import { useState, useEffect, useRef } from 'react';
import { addDays, subDays, startOfWeek, format, isSameDay } from 'date-fns';
import DayModal from '../dayModal/dayModal';

const hours = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
  '19:00','20:00','21:00','22:00','23:00'
];

const weekDaysNames = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
  'Sexta-feira', 'Sábado', 'Domingo'
];

export interface Task {
  id: string;
  date: string;
  taskName: string;
  taskDescription: string;
  taskInitialTime: string;
  taskFinalTime: string;
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36)}`;
}

function isHourInRange(hour: string, start: string, end: string) {
  return hour >= start && hour < end;
}

export default function Table() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const isFirstRender = useRef(true); // <-- flag para pular primeiro salvamento

  // Carregar do localStorage na montagem
  useEffect(() => {
    const stored = localStorage.getItem('user_routine_tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch (e) {}
    }
  }, []);

  // Salvar no localStorage, mas pular a primeira execução
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('user_routine_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // ... o resto do seu componente permanece igual
  // (as funções openModal, closeModal, handleSaveTask, etc. – copie do seu código atual)

  // Geração das datas da semana
  const weekDates = weekDaysNames.map((_, idx) => addDays(weekStart, idx));

  const goToPreviousWeek = () => setWeekStart(subDays(weekStart, 7));
  const goToNextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  function loadTemplate() {
    const storedTemplate = localStorage.getItem('weekly_template');
    if (!storedTemplate) {
      alert('Nenhum template salvo.');
      return;
    }
    let template;
    try { template = JSON.parse(storedTemplate); } catch(e) { return; }
    if (!window.confirm('Aplicar template na semana atual?')) return;

    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    const tasksWithoutWeek = tasks.filter(t => t.date < weekStartStr || t.date > weekEndStr);
    const newTasks: Task[] = [];

    weekDates.forEach((date, idx) => {
      const dayName = weekDaysNames[idx];
      const dayTasks = template.filter((t: any) => t.day === dayName);
      dayTasks.forEach((tmpl: any) => {
        newTasks.push({
          id: generateId(),
          date: format(date, 'yyyy-MM-dd'),
          taskName: tmpl.taskName,
          taskDescription: tmpl.taskDescription,
          taskInitialTime: tmpl.taskInitialTime,
          taskFinalTime: tmpl.taskFinalTime,
        });
      });
    });
    setTasks([...tasksWithoutWeek, ...newTasks]);
    alert(`Template aplicado! ${newTasks.length} tarefas.`);
  }

  function openModal(date: string, hour: string, task?: Task) {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedTask(task ?? null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedHour(null);
    setSelectedTask(null);
  }

  function handleSaveTask(task: Task) {
    setTasks(prev => {
      const exists = prev.some(t => t.id === task.id);
      return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, task];
    });
    closeModal();
  }

  function handleDeleteTask(taskId: string) {
    if (window.confirm('Excluir tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      closeModal();
    }
  }

  const tasksForSelectedDate = selectedDate ? tasks.filter(t => t.date === selectedDate) : [];

  // Renderização (igual ao que você já tinha, com o botão de template)
  return (
    <>
      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>← Semana anterior</button>
        <button onClick={goToToday}>Hoje</button>
        <button onClick={goToNextWeek}>Próxima semana →</button>
        <span className="week-range">{format(weekStart, 'dd/MM/yyyy')} - {format(addDays(weekStart, 6), 'dd/MM/yyyy')}</span>
        <button className="load-template-btn" onClick={loadTemplate}>📋 Carregar template</button>
      </div>

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="table-header-title">Horário</th>
              {weekDates.map((date, idx) => {
                const isToday = isSameDay(date, new Date());
                return (
                  <th key={idx} className={`table-header-day ${isToday ? 'today-header' : ''}`}>
                    <div className="day-name">{weekDaysNames[idx]}</div>
                    <div className="day-number">{format(date, 'dd/MM')}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="hour-cell">{hour}</td>
                {weekDates.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const task = tasks.find(t =>
                    t.date === dateStr && isHourInRange(hour, t.taskInitialTime, t.taskFinalTime)
                  );
                  return (
                    <td
                      key={dateStr}
                      className={`day-cell ${task ? 'occupied' : ''}`}
                      onClick={() => openModal(dateStr, hour, task)}
                    >
                      {task && (
                        <div className="task">
                          <strong>{task.taskName}</strong>
                          {task.taskDescription && <span className="task-description">{task.taskDescription}</span>}
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

      {isModalOpen && selectedDate && selectedHour && (
        <DayModal
          date={selectedDate}
          hour={selectedHour}
          task={selectedTask}
          existingTasks={tasksForSelectedDate}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onClose={closeModal}
        />
      )}
    </>
  );
}