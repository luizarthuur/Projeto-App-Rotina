import { createPortal } from 'react-dom';
import './dayModal.css';
import { useState } from 'react';
import type { Task } from '../table/table';

interface DayModalProps {
  onClose: () => void;
  day: string;
  onAddTask: (task: Task) => void;
}

interface DayModalInfo{
  taskName: string;
  taskDescription: string;
  taskInitialTime: string;
  taskFinalTime: string;
}

export default function DayModal({ onClose, day, onAddTask }: DayModalProps) {
  const [dayModalInfo, setDayModalInfo] = useState<DayModalInfo>({
    taskName: '',
    taskDescription: '',
    taskInitialTime: '',
    taskFinalTime: '',
  });

  function handleAddTask() {
    onAddTask({
      day,
      hour: dayModalInfo.taskInitialTime,
      taskName: dayModalInfo.taskName,
      taskDescription: dayModalInfo.taskDescription,
      taskInitialTime: dayModalInfo.taskInitialTime,
      taskFinalTime: dayModalInfo.taskFinalTime,
    });
  
    setDayModalInfo({
      taskName: '',
      taskDescription: '',
      taskInitialTime: '',
      taskFinalTime: '',
    });
  
    onClose();
  }

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="modal-container">
        <div className="modal-content">
          <h1 className='modal-content-title'>{day}</h1>

          {dayModalInfo.taskName && dayModalInfo.taskInitialTime && dayModalInfo.taskFinalTime && (
          <div className='modal-content-info-container'>
          <div className='modal-content-info-item'>
            <h1 className='modal-content-info-item-title'>Nome da tarefa</h1>
            <p className='modal-content-info-item-name'>{dayModalInfo.taskName}</p>
            <h1 className='modal-content-info-item-title'>Descrição da tarefa</h1>
            <p className='modal-content-info-item-description'>{dayModalInfo.taskDescription}</p>
            <h1 className='modal-content-info-item-title'>Horas de duração:</h1>
            <p className='modal-content-info-item-duration'>{new Date(dayModalInfo.taskFinalTime).getTime() - new Date(dayModalInfo.taskInitialTime).getTime() / 1000 / 60 / 60} horas</p>
          </div>
          </div>
          )}

          <div className='modal-content-info'>
            <input type="text" placeholder='Nome da tarefa' value={dayModalInfo.taskName} onChange={(e) => setDayModalInfo({ ...dayModalInfo, taskName: e.target.value })} />
            <input type="text" placeholder='Descrição da tarefa' value={dayModalInfo.taskDescription} onChange={(e) => setDayModalInfo({ ...dayModalInfo, taskDescription: e.target.value })} />
            <input type="time" placeholder='Hora inicial' value={dayModalInfo.taskInitialTime} onChange={(e) => setDayModalInfo({ ...dayModalInfo, taskInitialTime: e.target.value })} />
            <input type="time" placeholder='Hora final' value={dayModalInfo.taskFinalTime} onChange={(e) => setDayModalInfo({ ...dayModalInfo, taskFinalTime: e.target.value })} />
            <button onClick={handleAddTask}>Adicionar tarefa</button>
          </div>

          <button onClick={onClose} className='modal-content-button'>Fechar</button>
        </div>
      </div>
    </>,
    document.body
  );
}
