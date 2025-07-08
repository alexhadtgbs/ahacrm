'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, getCurrentLocale } from '@/lib/utils'
import type { Case, CaseWithNotes, Note } from '@/types'

// Mock data for development
const mockCase: CaseWithNotes = {
  id: 1,
  created_at: '2024-01-15T10:30:00Z',
  assigned_to: 'user1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+39 123 456 7890',
  email: 'mario.rossi@email.com',
  channel: 'WEB',
  origin: 'Website Contact Form',
  status: 'IN_CORSO',
  outcome: 'Interested in LASIK',
  clinic: 'Centro Oculistico Milano',
  treatment: 'LASIK Surgery',
  promotion: 'Spring Special',
  follow_up_date: '2024-01-20T14:00:00Z',
  dialer_campaign_tag: 'Q1-Follow-Up',
  notes: [
    {
      id: 1,
      created_at: '2024-01-15T11:00:00Z',
      case_id: 1,
      user_id: 'user1',
      content: 'Initial contact made. Patient interested in LASIK surgery. Scheduled follow-up call.'
    },
    {
      id: 2,
      created_at: '2024-01-16T14:30:00Z',
      case_id: 1,
      user_id: 'user1',
      content: 'Follow-up call completed. Patient has questions about recovery time and costs.'
    }
  ]
}

export default function CaseDetailPage() {
  const [caseData, setCaseData] = useState<CaseWithNotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  useEffect(() => {
    // Simulate loading case data
    setTimeout(() => {
      setCaseData(mockCase)
      setLoading(false)
    }, 500)
  }, [caseId])

  const handleSave = async () => {
    if (!caseData) return
    
    setSaving(true)
    try {
      // TODO: Implement save logic
      console.log('Saving case:', caseData)
      setEditing(false)
    } catch (error) {
      console.error('Error saving case:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !caseData) return

    const note: Note = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      case_id: caseData.id,
      user_id: 'user1', // TODO: Get from auth
      content: newNote
    }

    setCaseData({
      ...caseData,
      notes: [note, ...caseData.notes]
    })
    setNewNote('')
  }

  const handleStatusChange = (newStatus: string) => {
    if (!caseData) return
    setCaseData({
      ...caseData,
      status: newStatus as any
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading case...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 text-text-primary">Case not found</h2>
          <p className="text-text-secondary">The case you're looking for doesn't exist.</p>
          <Button onClick={() => {
            const locale = getCurrentLocale()
            router.push(`/${locale}/cases`)
          }} className="mt-4">
            Back to Cases
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => {
                const locale = getCurrentLocale()
                router.push(`/${locale}/cases`)
              }}>
                ← Back to Cases
              </Button>
              <div>
                <h1 className="text-h1 text-text-primary">
                  Case #{caseData.id} - {caseData.first_name} {caseData.last_name}
                </h1>
                <p className="text-text-secondary">Created {formatDate(caseData.created_at)}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => window.open('/api-docs', '_blank')}>
                API Docs
              </Button>
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button loading={saving} onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  Edit Case
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Case Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-h2 text-text-primary mb-4">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={caseData.first_name}
                  onChange={(e) => setCaseData({ ...caseData, first_name: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Last Name"
                  value={caseData.last_name}
                  onChange={(e) => setCaseData({ ...caseData, last_name: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Phone"
                  value={caseData.phone}
                  onChange={(e) => setCaseData({ ...caseData, phone: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={caseData.email || ''}
                  onChange={(e) => setCaseData({ ...caseData, email: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Clinic"
                  value={caseData.clinic}
                  onChange={(e) => setCaseData({ ...caseData, clinic: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Treatment"
                  value={caseData.treatment || ''}
                  onChange={(e) => setCaseData({ ...caseData, treatment: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Origin"
                  value={caseData.origin}
                  onChange={(e) => setCaseData({ ...caseData, origin: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Promotion"
                  value={caseData.promotion || ''}
                  onChange={(e) => setCaseData({ ...caseData, promotion: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="card">
              <h2 className="text-h2 text-text-primary mb-4">Notes & Observations</h2>
              
              {/* Add Note */}
              <div className="mb-6">
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <p className="text-text-primary">{note.content}</p>
                      <span className="text-sm text-text-secondary">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="card">
              <h2 className="text-h2 text-text-primary mb-4">Status & Actions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-label font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={caseData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={!editing}
                  >
                    <option value="IN_CORSO">In Progress</option>
                    <option value="APPUNTAMENTO">Appointment Scheduled</option>
                    <option value="CHIUSO">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label font-medium text-text-primary mb-2">
                    Channel
                  </label>
                  <select
                    className="input-field"
                    value={caseData.channel}
                    onChange={(e) => setCaseData({ ...caseData, channel: e.target.value as any })}
                    disabled={!editing}
                  >
                    <option value="WEB">Web</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INFLUENCER">Influencer</option>
                  </select>
                </div>

                <Input
                  label="Outcome"
                  value={caseData.outcome || ''}
                  onChange={(e) => setCaseData({ ...caseData, outcome: e.target.value })}
                  disabled={!editing}
                />

                <Input
                  label="Follow-up Date"
                  type="datetime-local"
                  value={caseData.follow_up_date ? caseData.follow_up_date.slice(0, 16) : ''}
                  onChange={(e) => setCaseData({ ...caseData, follow_up_date: e.target.value })}
                  disabled={!editing}
                />

                <Input
                  label="Dialer Campaign Tag"
                  value={caseData.dialer_campaign_tag || ''}
                  onChange={(e) => setCaseData({ ...caseData, dialer_campaign_tag: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-h2 text-text-primary mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
                <Button variant="outline" className="w-full">
                  Make Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 