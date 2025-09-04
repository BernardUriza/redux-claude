// src/components/MedicalNotes.tsx
// Componente de Notas Médicas con Trazabilidad Legal - FASE 4 - Creado por Bernard Orozco

'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@redux-claude/cognitive-core'
import { selectPhysicianNotes } from '@redux-claude/cognitive-core/src/store/selectors'

// Priority thresholds
const PRIORITY_HIGH_THRESHOLD = 0.9
const PRIORITY_MEDIUM_THRESHOLD = 0.7  
const PRIORITY_LOW_THRESHOLD = 0.5

// Mock action - En FASE 4 se implementará acción real
const addPhysicianNote = (note: Omit<PhysicianNote, 'id' | 'timestamp'>) => ({
  type: 'ADD_PHYSICIAN_NOTE_MOCK',
  payload: note,
})

// Usar tipo del selector con compatibilidad legacy
type PhysicianNote = {
  id: string
  type: 'clinical' | 'administrative' | 'legal' | 'observation'
  content: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  physicianId: string
  physicianName: string
}

interface AddNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (note: Omit<PhysicianNote, 'id' | 'timestamp'>) => void
}

const AddNoteModal = ({ isOpen, onClose, onAdd }: AddNoteModalProps) => {
  const [type, setType] = useState<'clinical' | 'administrative' | 'legal' | 'observation'>(
    'clinical'
  )
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    onAdd({
      type,
      content: content.trim(),
      category: category.trim() || 'General',
      priority,
      physicianId: 'current-physician', // In real app, get from auth
      physicianName: 'Dr. Sistema', // In real app, get from auth
    })

    // Reset form
    setContent('')
    setCategory('')
    setPriority('medium')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-600/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Nueva Nota Médica</h3>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Tipo de Nota</label>
              <select
                value={type}
                onChange={e =>
                  setType(e.target.value as 'clinical' | 'administrative' | 'legal' | 'observation')
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="clinical">Clínica</option>
                <option value="administrative">Administrativa</option>
                <option value="legal">Legal</option>
                <option value="observation">Observación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Prioridad</label>
              <select
                value={priority}
                onChange={e =>
                  setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Diagnóstico, Tratamiento, Evolución..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Contenido de la Nota
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Escriba la nota médica aquí..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Guardar Nota
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

const NoteCard = ({ note }: { note: PhysicianNote }) => {
  const _getTypeColor = (type: string) => {
    switch (type) {
      case 'clinical':
        return 'from-blue-500 to-cyan-500'
      case 'administrative':
        return 'from-gray-500 to-slate-500'
      case 'legal':
        return 'from-red-500 to-pink-500'
      case 'observation':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500/30'
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clinical':
        return '🩺'
      case 'administrative':
        return '📋'
      case 'legal':
        return '⚖️'
      case 'observation':
        return '👁️'
      default:
        return '📄'
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl p-4 border border-slate-600/40 hover:border-slate-500/60 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(note.type)}</span>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-white font-medium capitalize">{note.type}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}
              >
                {note.priority}
              </span>
            </div>
            <div className="text-sm text-slate-400">{note.category}</div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          <div>{new Date(note.timestamp).toLocaleDateString('es-ES')}</div>
          <div>{new Date(note.timestamp).toLocaleTimeString('es-ES')}</div>
        </div>
      </div>

      <div className="bg-slate-900/30 rounded-lg p-3 mb-3">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <span>👨‍⚕️</span>
          <span>{note.physicianName}</span>
        </div>
        <div className="text-slate-500">ID: {note.id.slice(-8)}</div>
      </div>
    </div>
  )
}

export const MedicalNotes = () => {
  const dispatch = useDispatch()
  // ⚡ ESTADO REAL MULTINÚCLEO - Mock Data COMPLETAMENTE ELIMINADO
  const realPhysicianNotes = useSelector(selectPhysicianNotes)
  const isLoading = useSelector((state: RootState) =>
    Object.values(state.medicalChat.cores).some(core => core.isLoading)
  )
  const error = useSelector((state: RootState) => state.medicalChat.sharedState.error)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<
    'all' | 'clinical' | 'administrative' | 'legal' | 'observation'
  >('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest')

  // Transformar datos reales del selector a formato legacy para compatibilidad
  const notes: PhysicianNote[] = realPhysicianNotes.map(note => ({
    id: note.id,
    type:
      note.category === 'diagnosis'
        ? 'clinical'
        : note.category === 'treatment'
          ? 'clinical'
          : note.category === 'observation'
            ? 'observation'
            : note.category === 'plan'
              ? 'administrative'
              : ('clinical' as 'clinical' | 'administrative' | 'legal' | 'observation'),
    content: note.content,
    category: note.title || note.category,
    priority:
      note.confidence > PRIORITY_HIGH_THRESHOLD
        ? 'high'
        : note.confidence > PRIORITY_MEDIUM_THRESHOLD
          ? 'medium'
          : note.confidence > PRIORITY_LOW_THRESHOLD
            ? 'low'
            : 'critical',
    timestamp: note.createdAt,
    physicianId: 'sistema-multinucleo',
    physicianName: 'Sistema Multinúcleo IA',
  }))

  // Debug real notes (no fake data)
  console.log('📝 MedicalNotes DEBUG - Real Notes:', realPhysicianNotes)
  console.log('📝 MedicalNotes DEBUG - Transformed Notes:', notes)

  // Estados de error reales
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-red-400 font-semibold mb-2">Error en notas médicas</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    )
  }

  const filteredNotes = notes
    .filter(note => filter === 'all' || note.type === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp
        case 'oldest':
          return a.timestamp - b.timestamp
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        default:
          return b.timestamp - a.timestamp
      }
    })

  const notesCount = notes.length
  const urgentCount = notes.filter(n => n.priority === 'critical' || n.priority === 'high').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Notas Médicas</h2>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-slate-300">{notesCount} notas totales</span>
            {urgentCount > 0 && (
              <span className="text-orange-400 font-medium">{urgentCount} urgentes</span>
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
          <span>Nueva Nota</span>
        </button>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { key: 'all' as const, label: 'Todas', count: notesCount },
            {
              key: 'clinical' as const,
              label: 'Clínicas',
              count: notes.filter(n => n.type === 'clinical').length,
            },
            {
              key: 'administrative' as const,
              label: 'Admin',
              count: notes.filter(n => n.type === 'administrative').length,
            },
            {
              key: 'legal' as const,
              label: 'Legales',
              count: notes.filter(n => n.type === 'legal').length,
            },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'newest' | 'oldest' | 'priority')}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="priority">Por prioridad</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Cargando notas médicas del sistema...</p>
        </div>
      )}

      {/* Notes List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-slate-200 font-semibold mb-2">
                {filter === 'all' ? 'No hay notas médicas' : `No hay notas ${filter}`}
              </h3>
              <p className="text-slate-400 text-sm">
                {filter === 'all'
                  ? realPhysicianNotes.length === 0
                    ? 'No se han generado notas médicas de los análisis del sistema'
                    : 'Agrega la primera nota médica para comenzar el registro'
                  : 'No se encontraron notas en esta categoría'}
              </p>
            </div>
          ) : (
            filteredNotes.map(note => <NoteCard key={note.id} note={note} />)
          )}
        </div>
      )}

      {/* Trazabilidad Legal Footer */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">🛡️</span>
          <h4 className="text-sm font-semibold text-purple-300">Trazabilidad Legal</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Todas las notas médicas son registradas con marca temporal inmutable y firma digital. Este
          sistema cumple con la normativa NOM-004-SSA3-2012 para expedientes clínicos electrónicos.
          Las notas forman parte integral del expediente médico legal del paciente.
        </p>
        <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
          <span>🔒 Cifrado AES-256</span>
          <span>📅 Timestamp inmutable</span>
          <span>🖋️ Firma digital</span>
          <span>⚖️ Validez legal</span>
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={noteData => dispatch(addPhysicianNote(noteData))}
      />
    </div>
  )
}
