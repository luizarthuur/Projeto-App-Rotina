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
  day: string
  taskName: string
  taskDescription: string
  taskInitialTime: string
  taskFinalTime: string
  hour: string
}

function isHourInRange(
  hour: string,
  start: string,
  end: string
) {
  return hour >= start && hour < end
}

export default function Table() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  function openDayModal(day: string, hour: string) {
    setSelectedDay(day)
    setSelectedHour(hour)
    setIsDayModalOpen(true)
  }

  function closeDayModal() {
    setIsDayModalOpen(false)
    setSelectedDay(null)
    setSelectedHour(null)
  }

  function handleAddTask(task: Task) {
    setTasks(prev => [...prev, task])
    closeDayModal()
  }

  return (
    <>
      {isDayModalOpen && selectedDay && selectedHour && (
        <DayModal
          day={selectedDay}
          hour={selectedHour}
          onClose={closeDayModal}
          onAddTask={handleAddTask}
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
                  const task = tasks.find(task =>
                    task.day === day &&
                    isHourInRange(
                      hour,
                      task.taskInitialTime,
                      task.taskFinalTime
                    )
                  )

                  return (
                    <td
                      key={`${day}-${hour}`}
                      className={`day-cell ${task ? 'occupied' : ''}`}
                      onClick={() => openDayModal(day, hour)}
                    >
                      {task && (
                        <div className="task">
                          <strong className='task-name'>{task.taskName}</strong>
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
