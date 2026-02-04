import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import './dayModal.css'
import type { Task } from '../table/table'

interface DayModalProps {
  onClose: () => void
  onSaveTask: (task: Task) => void
  day: string
  hour: string
  task?: Task | null
}

export default function DayModal({
  onClose,
  onSaveTask,
  day,
  task
}: DayModalProps) {
  const [form, setForm] = useState({
    taskName: '',
    taskDescription: '',
    taskInitialTime: '',
    taskFinalTime: ''
  })

  useEffect(() => {
    if (task) {
      setForm({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        taskInitialTime: task.taskInitialTime,
        taskFinalTime: task.taskFinalTime
      })
    } else {
      setForm({
        taskName: '',
        taskDescription: '',
        taskInitialTime: '',
        taskFinalTime: ''
      })
    }
  }, [task])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function handleSave() {
    onSaveTask({
      id: task?.id ?? crypto.randomUUID(),
      day,
      ...form
    })
  }

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="modal-container">
        <div className="modal-content">
          <h1 className="modal-content-title">{day}</h1>

          {task && (
            <div className="modal-content-task-preview">

              <div className='modal-content-task-preview-container'>
                <h1 className='modal-content-task-preview-title'>Título da tarefa:</h1>
                <p className='modal-content-task-preview-name'>{task.taskName}</p>
              </div>

              <div className='modal-content-task-preview-container'>
                <h1 className='modal-content-task-preview-title'>Descrição:</h1>
                <p className='modal-content-task-preview-description'>{task.taskDescription}</p>
              </div>

              <div className='modal-content-task-preview-container'>
                <h1 className='modal-content-task-preview-title'>Horário:</h1>
                <p className='modal-content-task-preview-time'>{task.taskInitialTime} - {task.taskFinalTime}</p>
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
            />

            <input
              type="text"
              name="taskDescription"
              placeholder="Descrição da tarefa"
              value={form.taskDescription}
              onChange={handleChange}
            />

            <input
              type="time"
              name="taskInitialTime"
              placeholder="Hora inicial"
              value={form.taskInitialTime}
              onChange={handleChange}
            />

            <input
              type="time"
              name="taskFinalTime"
              placeholder="Hora final"
              value={form.taskFinalTime}
              onChange={handleChange}
            />

            <div className='modal-content-button-container'>

            <button className='modal-content-button-save' onClick={handleSave}>
              {task ? 'Salvar tarefa' : 'Adicionar tarefa'}
            </button>

            <button
            onClick={onClose}
            className="modal-content-button-close"
          >
            Fechar
          </button>

          </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
