'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Header } from '@/components/ui/Header'
import { formatDate, getCurrentLocale } from '@/lib/utils'
import { fetchCases, updateCase, createNote, fetchNotes } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Case, CaseWithNotes, Note } from '@/types'

export default function CaseDetailPage() {
  const [caseData, setCaseData] = useState<CaseWithNotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const caseId = parseInt(params.id as string)

  useEffect(() => {
    if (caseId) {
      loadCaseData()
    }
  }, [caseId])

  const loadCaseData = async () => {
    try {
      setLoading(true)
      // Fetch case data
      const cases = await fetchCases()
      const caseItem = cases.find(c => c.id === caseId)
      
      if (!caseItem) {
        setCaseData(null)
        return
      }

      // Fetch notes for this case
      const notes = await fetchNotes(caseId)
      
      setCaseData({
        ...caseItem,
        notes: notes
      })
    } catch (error) {
      console.error('Error loading case data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!caseData) return
    
    setSaving(true)
    try {
      await updateCase(caseData.id, caseData)
      setEditing(false)
      await loadCaseData() // Refresh data
    } catch (error) {
      console.error('Error saving case:', error)
      alert('Failed to save case')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !caseData) return

    setAddingNote(true)
    try {
      const note = await createNote(caseData.id, newNote)
      setCaseData({
        ...caseData,
        notes: [note, ...caseData.notes]
      })
      setNewNote('')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note')
    } finally {
      setAddingNote(false)
    }
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
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
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
                  label="Home Phone"
                  value={caseData.home_phone}
                  onChange={(e) => setCaseData({ ...caseData, home_phone: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Cell Phone"
                  value={caseData.cell_phone}
                  onChange={(e) => setCaseData({ ...caseData, cell_phone: e.target.value })}
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
                <Input
                  label="Disposition"
                  value={caseData.disposition || ''}
                  onChange={(e) => setCaseData({ ...caseData, disposition: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g., Interested in consultation, Not interested, etc."
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
                  disabled={addingNote}
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!newNote.trim() || addingNote}
                    loading={addingNote}
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-text-primary">{note.content}</p>
                        {note.profiles && (
                          <p className="text-sm text-text-secondary mt-1">
                            By {note.profiles.full_name}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-text-secondary ml-4">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                {caseData.notes.length === 0 && (
                  <p className="text-text-secondary text-center py-4">
                    No notes yet. Add the first note above.
                  </p>
                )}
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