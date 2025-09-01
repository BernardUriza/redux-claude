// src/components/FollowUpTracker.tsx
// Componente de Seguimiento y Recordatorios - FASE 4 - Creado por Bernard Orozco

'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
// import { useSelector } from 'react-redux'
// import type { RootState } from '@redux-claude/cognitive-core'
// import { selectPatientReminders } from '@redux-claude/cognitive-core/src/store/selectors'
// 🧠 MULTINÚCLEO: Funciones legacy deshabilitadas - usando mocks
// import { addReminder, updateReminder, completeReminder, addPhysicianNote } from '@redux-claude/cognitive-core'
// import type { Reminder, PhysicianNote } from '@redux-claude/cognitive-core'

// Mocks temporales para mantener funcionalidad
const addReminder = (reminder: any) => ({ type: 'ADD_REMINDER_MOCK', payload: reminder })
const _updateReminder = (id: string, updates: any) => ({
  type: 'UPDATE_REMINDER_MOCK',
  payload: { id, updates },
})
const completeReminder = (id: string) => ({ type: 'COMPLETE_REMINDER_MOCK', payload: id })
const _addPhysicianNote = (note: any) => ({ type: 'ADD_NOTE_MOCK', payload: note })

type Reminder = {
  id: string
  type: 'followup' | 'medication' | 'study' | 'referral'
  description: string
  dueDate: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  completed: boolean
}

type _PhysicianNote = {
  id: string
  content: string
  timestamp: Date
}

interface AddReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (reminder: Omit<Reminder, 'id'>) => void
}

const AddReminderModal = ({ isOpen, onClose, onAdd }: AddReminderModalProps) => {
  const [type, setType] = useState<'followup' | 'medication' | 'study' | 'referral'>('followup')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !dueDate) return

    onAdd({
      type,
      description: description.trim(),
      dueDate: new Date(dueDate).getTime(),
      priority,
      completed: false,
    })

    // Reset form
    setDescription('')
    setDueDate('')
    setPriority('medium')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-600/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Nuevo Recordatorio</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="followup">Seguimiento</option>
              <option value="medication">Medicamento</option>
              <option value="study">Estudio</option>
              <option value="referral">Referencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe el recordatorio..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Prioridad</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Crear Recordatorio
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
  const dispatch = useDispatch()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'from-red-500 to-pink-500'
      case 'high':
        return 'from-orange-500 to-yellow-500'
      case 'medium':
        return 'from-blue-500 to-cyan-500'
      case 'low':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'followup':
        return '📅'
      case 'medication':
        return '💊'
      case 'study':
        return '🔬'
      case 'referral':
        return '👨‍⚕️'
      default:
        return '📋'
    }
  }

  const isOverdue = new Date(reminder.dueDate) < new Date()
  const daysUntilDue = Math.ceil((reminder.dueDate - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div
      className={`bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border transition-all ${
        reminder.completed
          ? 'border-green-600/30 opacity-60'
          : isOverdue
            ? 'border-red-500/50'
            : 'border-slate-600/40 hover:border-slate-500/60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
          <div>
            <div className="text-white font-medium capitalize">
              {reminder.type.replace('_', ' ')}
            </div>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(reminder.priority)} text-white`}
            >
              {reminder.priority}
            </div>
          </div>
        </div>

        {!reminder.completed && (
          <button
            onClick={() => dispatch(completeReminder(reminder.id))}
            className="text-green-400 hover:text-green-300 transition-colors"
            title="Marcar como completado"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="text-slate-300 mb-3">{reminder.description}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="text-slate-400">{new Date(reminder.dueDate).toLocaleString('es-ES')}</div>
        <div
          className={`font-medium ${
            reminder.completed
              ? 'text-green-400'
              : isOverdue
                ? 'text-red-400'
                : daysUntilDue <= 1
                  ? 'text-yellow-400'
                  : 'text-slate-400'
          }`}
        >
          {reminder.completed
            ? '✅ Completado'
            : isOverdue
              ? '⚠️ Vencido'
              : daysUntilDue === 0
                ? '🔥 Hoy'
                : `${daysUntilDue} días`}
        </div>
      </div>
    </div>
  )
}

export const FollowUpTracker = () => {
  const dispatch = useDispatch()
  // 🧠 MULTINÚCLEO: Mock data temporal para mantener funcionalidad
  const mockReminders: Reminder[] = []
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')

  const filteredReminders = mockReminders
    .filter(reminder => {
      switch (filter) {
        case 'pending':
          return !reminder.completed
        case 'completed':
          return reminder.completed
        default:
          return true
      }
    })
    .sort((a, b) => {
      // Prioritize by completion status, then by due date
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return a.dueDate - b.dueDate
    })

  const pendingCount = mockReminders.filter(r => !r.completed).length
  const overdueCount = mockReminders.filter(
    r => !r.completed && new Date(r.dueDate) < new Date()
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Seguimiento y Recordatorios</h2>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-slate-300">{pendingCount} pendientes</span>
            {overdueCount > 0 && (
              <span className="text-red-400 font-medium">{overdueCount} vencidos</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar</span>
        </button>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
        {[
          { key: 'pending' as const, label: 'Pendientes', count: pendingCount },
          {
            key: 'completed' as const,
            label: 'Completados',
            count: mockReminders.filter(r => r.completed).length,
          },
          { key: 'all' as const, label: 'Todos', count: mockReminders.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-slate-200 font-semibold mb-2">
              {filter === 'pending'
                ? 'No hay recordatorios pendientes'
                : filter === 'completed'
                  ? 'No hay recordatorios completados'
                  : 'No hay recordatorios'}
            </h3>
            <p className="text-slate-400 text-sm">
              {filter === 'pending'
                ? 'Todos los recordatorios están completados'
                : filter === 'completed'
                  ? 'Aún no se han completado recordatorios'
                  : 'Agrega recordatorios para seguimiento médico'}
            </p>
          </div>
        ) : (
          filteredReminders.map(reminder => <ReminderCard key={reminder.id} reminder={reminder} />)
        )}
      </div>
      ){/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={reminderData => dispatch(addReminder(reminderData))}
      />
    </div>
  )
}
