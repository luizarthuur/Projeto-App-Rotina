import './table.css'
import { useState } from 'react'
import DayModal from '../dayModal/dayModal'

const hours = [
  "07:00","07:30","08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30",
  "19:00","19:30","20:00","20:30","21:00","21:30",
  "22:00","22:30","23:00"
]

const days = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
]

export interface Task {
  id: string
  day: string
  taskName: string
  taskDescription: string
  taskInitialTime: string
  taskFinalTime: string
}

function isHourInRange(hour: string, start: string, end: string) {
  return hour >= start && hour < end
}

export default function Table() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  function openDayModal(day: string, hour: string, task?: Task) {
    setSelectedDay(day)
    setSelectedHour(hour)
    setSelectedTask(task ?? null)
    setIsDayModalOpen(true)
  }

  function closeDayModal() {
    setIsDayModalOpen(false)
    setSelectedDay(null)
    setSelectedHour(null)
    setSelectedTask(null)
  }

  function handleSaveTask(task: Task) {
    setTasks(prev => {
      const exists = prev.some(t => t.id === task.id)
      return exists
        ? prev.map(t => (t.id === task.id ? task : t))
        : [...prev, task]
    })

    closeDayModal()
  }

  return (
    <>
      {isDayModalOpen && selectedDay && selectedHour && (
        <DayModal
          day={selectedDay}
          hour={selectedHour}
          task={selectedTask}
          onClose={closeDayModal}
          onSaveTask={handleSaveTask}
        />
      )}

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="table-header-title">Horário</th>
              {days.map(day => (
                <th key={day} className="table-header-day">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hours.map(hour => (
              <tr key={hour} className="table-row">
                <td className="hour-cell">{hour}</td>

                {days.map(day => {
                  const task = tasks.find(t =>
                    t.day === day &&
                    isHourInRange(
                      hour,
                      t.taskInitialTime,
                      t.taskFinalTime
                    )
                  )

                  return (
                    <td
                      key={`${day}-${hour}`}
                      className={`day-cell ${task ? 'occupied' : ''}`}
                      onClick={() =>
                        openDayModal(day, hour, task)
                      }
                    >
                      {task && (
                        <div className="task">
                          <strong>{task.taskName}</strong>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
