import type { Case } from '@/types'

// API base URL
const API_BASE = '/api'

// Fetch all cases
export async function fetchCases(filters?: Record<string, string>): Promise<Case[]> {
  const params = new URLSearchParams(filters)
  const url = `${API_BASE}/cases${params.toString() ? `?${params.toString()}` : ''}`
  
  const response = await fetch(url, {
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch cases')
  }
  
  return response.json()
}

// Create a new case
export async function createCase(caseData: Omit<Case, 'id' | 'created_at'>): Promise<Case> {
  const response = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(caseData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create case')
  }
  
  return response.json()
}

// Update a case (full update)
export async function updateCase(id: number, caseData: Partial<Case>): Promise<Case> {
  const response = await fetch(`${API_BASE}/cases`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id, ...caseData }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update case')
  }
  
  return response.json()
}

// Update a case (partial update)
export async function patchCase(id: number, caseData: Partial<Case>): Promise<Case> {
  const response = await fetch(`${API_BASE}/cases`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id, ...caseData }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update case')
  }
  
  return response.json()
}

// Delete a case
export async function deleteCase(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/cases?id=${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete case')
  }
}

// Update case status
export async function updateCaseStatus(id: number, status: Case['status']): Promise<Case> {
  return patchCase(id, { status })
}

// Update case outcome
export async function updateCaseOutcome(id: number, outcome: string): Promise<Case> {
  return patchCase(id, { outcome })
}

// Update case follow-up date
export async function updateCaseFollowUpDate(id: number, followUpDate: string | null): Promise<Case> {
  return patchCase(id, { follow_up_date: followUpDate || undefined })
}

// Assign case to user
export async function assignCase(id: number, assignedTo: string): Promise<Case> {
  return patchCase(id, { assigned_to: assignedTo })
} 