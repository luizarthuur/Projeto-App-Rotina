// Table.tsx (versão com persistência garantida)
import './table.css';
import { useState, useEffect } from 'react';
import {
  addDays,
  subDays,
  startOfWeek,
  format,
  isSameDay,
} from 'date-fns';
import DayModal from '../dayModal/dayModal';

const hours = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00',
];

const dayNames = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export interface Task {
  id: string;
  date: string;
  taskName: string;
  taskDescription: string;
  taskInitialTime: string;
  taskFinalTime: string;
}

function isHourInRange(hour: string, start: string, end: string): boolean {
  return hour >= start && hour < end;
}

// Chave única para o storage
const STORAGE_KEY = 'routine_tasks';

export default function Table() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tarefas do localStorage - apenas uma vez na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('🔍 [LOAD] Conteúdo bruto do localStorage:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          console.log('✅ [LOAD] Tarefas carregadas com sucesso:', parsed.length);
        } else {
          console.warn('⚠️ [LOAD] Dado não é array, resetando.');
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
      } else {
        console.log('📦 [LOAD] Nenhuma tarefa encontrada, inicializando vazio.');
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } catch (err) {
      console.error('❌ [LOAD] Erro ao ler localStorage:', err);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persistir tarefas SEMPRE que o estado tasks mudar
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        console.log('💾 [SAVE] Tarefas salvas:', tasks.length);
      } catch (err) {
        console.error('❌ [SAVE] Erro ao gravar no localStorage:', err);
      }
    }
  }, [tasks, isLoading]);

  // Função manual para testar gravação (opcional)
  const testSave = () => {
    const testTask: Task = {
      id: 'test-id',
      date: format(new Date(), 'yyyy-MM-dd'),
      taskName: 'Tarefa teste',
      taskDescription: 'Teste manual',
      taskInitialTime: '12:00',
      taskFinalTime: '13:00',
    };
    setTasks(prev => [...prev, testTask]);
  };

  const weekDates = dayNames.map((_, idx) => addDays(weekStart, idx));

  const goToPreviousWeek = () => setWeekStart(subDays(weekStart, 7));
  const goToNextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToToday = () =>
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  function openDayModal(date: string, hour: string, task?: Task) {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedTask(task ?? null);
    setIsDayModalOpen(true);
  }

  function closeDayModal() {
    setIsDayModalOpen(false);
    setSelectedDate(null);
    setSelectedHour(null);
    setSelectedTask(null);
  }

  function handleSaveTask(task: Task) {
    console.log('📝 [SAVE_TASK] Recebida tarefa para salvar:', task);
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      let newTasks;
      if (exists) {
        newTasks = prev.map((t) => (t.id === task.id ? task : t));
        console.log('✏️ Atualizando tarefa existente');
      } else {
        newTasks = [...prev, task];
        console.log('➕ Adicionando nova tarefa');
      }
      return newTasks;
    });
    closeDayModal();
  }

  function handleDeleteTask(taskId: string) {
    if (window.confirm('Excluir esta tarefa permanentemente?')) {
      console.log('🗑️ [DELETE] Deletando tarefa:', taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      closeDayModal();
    }
  }

  const tasksForSelectedDate = selectedDate
    ? tasks.filter((t) => t.date === selectedDate)
    : [];

  if (isLoading) {
    return <div>Carregando agenda...</div>;
  }

  return (
    <>
      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>← Semana anterior</button>
        <button onClick={goToToday}>Hoje</button>
        <button onClick={goToNextWeek}>Próxima semana →</button>
        <span className="week-range">
          {format(weekStart, 'dd/MM/yyyy')} -{' '}
          {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
        </span>
      </div>

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="table-header-title">Horário</th>
              {dayNames.map((dayName, idx) => {
                const date = weekDates[idx];
                const isToday = isSameDay(date, new Date());
                return (
                  <th
                    key={dayName}
                    className={`table-header-day ${isToday ? 'today-header' : ''}`}
                  >
                    <div className="day-name">{dayName}</div>
                    <div className="day-number">{format(date, 'dd/MM')}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="hour-cell">{hour}</td>
                {weekDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const task = tasks.find(
                    (t) =>
                      t.date === dateStr &&
                      isHourInRange(hour, t.taskInitialTime, t.taskFinalTime)
                  );
                  return (
                    <td
                      key={dateStr}
                      className={`day-cell ${task ? 'occupied' : ''}`}
                      onClick={() => openDayModal(dateStr, hour, task)}
                    >
                      {task && (
                        <div className="task">
                          <strong>{task.taskName}</strong>
                          {task.taskDescription && (
                            <span className="task-description">
                              {task.taskDescription}
                            </span>
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

      {isDayModalOpen && selectedDate && selectedHour && (
        <DayModal
          date={selectedDate}
          hour={selectedHour}
          task={selectedTask}
          existingTasks={tasksForSelectedDate}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onClose={closeDayModal}
        />
      )}
    </>
  );
}