'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, getCurrentLocale } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { fetchCases, updateCaseStatus, createCase } from '@/lib/api'
import type { Case, CaseFilters, CaseFormData } from '@/types'

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [filters, setFilters] = useState<CaseFilters>({})
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingCase, setCreatingCase] = useState(false)
  const [createFormData, setCreateFormData] = useState<CaseFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    home_phone: '',
    cell_phone: '',
    email: '',
    channel: 'WEB',
    origin: '',
    status: 'IN_CORSO',
    disposition: '',
    outcome: '',
    clinic: '',
    treatment: '',
    promotion: '',
    follow_up_date: '',
    dialer_campaign_tag: '',
    assigned_to: ''
  })
  const router = useRouter()
  const { user, signOut } = useAuth()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Apply filters
    let filtered = cases

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.first_name.toLowerCase().includes(searchLower) ||
        c.last_name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.toLowerCase().includes(searchLower) ||
        c.home_phone?.toLowerCase().includes(searchLower) ||
        c.cell_phone?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status)
    }

    if (filters.channel) {
      filtered = filtered.filter(c => c.channel === filters.channel)
    }

    if (filters.date_from) {
      filtered = filtered.filter(c => new Date(c.created_at) >= new Date(filters.date_from!))
    }

    if (filters.date_to) {
      filtered = filtered.filter(c => new Date(c.created_at) <= new Date(filters.date_to!))
    }

    setFilteredCases(filtered)
  }, [cases, filters])

  // Fetch cases from API
  const loadCases = async () => {
    try {
      setLoading(true)
      const data = await fetchCases()
      setCases(data)
      setFilteredCases(data)
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication status
    if (user === null && !hasRedirected.current) {
      // User is not authenticated and we haven't redirected yet
      console.log('User not authenticated, redirecting to login...')
      hasRedirected.current = true
      const locale = getCurrentLocale()
      router.push(`/${locale}/login`)
      return
    }
    
    if (user !== undefined) {
      // User authentication state is determined
      setAuthLoading(false)
      // Fetch cases when user is authenticated
      loadCases()
    }
  }, [user, router])

  const handleCaseClick = (caseId: number) => {
    const locale = getCurrentLocale()
    router.push(`/${locale}/cases/${caseId}`)
  }

  const handleExport = async () => {
    try {
      // Call the export API
      const response = await fetch('/api/export', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Get the CSV content
      const csvContent = await response.text()
      
      // Create a blob and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointments-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV file')
    }
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      const locale = getCurrentLocale()
      router.push(`/${locale}/login`)
    }
  }

  const handleStatusChange = async (caseId: number, newStatus: Case['status']) => {
    try {
      await updateCaseStatus(caseId, newStatus)
      // Refresh the cases list
      await loadCases()
    } catch (error) {
      console.error('Error updating case status:', error)
    }
  }

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!createFormData.first_name || !createFormData.last_name || !createFormData.phone || !createFormData.channel || !createFormData.origin || !createFormData.clinic) {
      alert('Please fill in all required fields')
      return
    }

    setCreatingCase(true)
    try {
      const newCase = await createCase(createFormData)
      
      // Add the new case to the list
      setCases([newCase, ...cases])
      
      // Reset form and close modal
      setCreateFormData({
        first_name: '',
        last_name: '',
        phone: '',
        home_phone: '',
        cell_phone: '',
        email: '',
        channel: 'WEB',
        origin: '',
        status: 'IN_CORSO',
        disposition: '',
        outcome: '',
        clinic: '',
        treatment: '',
        promotion: '',
        follow_up_date: '',
        dialer_campaign_tag: '',
        assigned_to: ''
      })
      setShowCreateModal(false)
      
      // Show success message
      alert('Case created successfully!')
    } catch (error) {
      console.error('Error creating case:', error)
      alert('Failed to create case. Please try again.')
    } finally {
      setCreatingCase(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_CORSO':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPUNTAMENTO':
        return 'bg-green-100 text-green-800'
      case 'CHIUSO':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading while checking authentication or fetching data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">
            {authLoading ? 'Loading...' : 'Fetching cases...'}
          </p>
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
            <div>
              <h1 className="text-h1 text-text-primary">Cases</h1>
              <p className="text-text-secondary">Manage patient leads and inquiries</p>
              {user && (
                <p className="text-sm text-text-secondary mt-1">
                  Welcome, {user.email}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => window.open('/api-docs', '_blank')}>
                API Docs
              </Button>
              <Button variant="outline" onClick={() => {
                const locale = getCurrentLocale()
                router.push(`/${locale}/api-keys`)
              }}>
                API Keys
              </Button>
              <Button variant="outline" onClick={handleExport}>
                Export Appointments
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                New Case
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Create New Case</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleCreateCase} className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="text-lg font-semibold text-text-primary md:col-span-2">Patient Information</h3>
                
                <Input
                  label="First Name *"
                  value={createFormData.first_name}
                  onChange={(e) => setCreateFormData({ ...createFormData, first_name: e.target.value })}
                  required
                />
                
                <Input
                  label="Last Name *"
                  value={createFormData.last_name}
                  onChange={(e) => setCreateFormData({ ...createFormData, last_name: e.target.value })}
                  required
                />
                
                <Input
                  label="Phone *"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  required
                />
                
                <Input
                  label="Home Phone"
                  value={createFormData.home_phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, home_phone: e.target.value })}
                />
                
                <Input
                  label="Cell Phone"
                  value={createFormData.cell_phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, cell_phone: e.target.value })}
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                />
              </div>

              {/* Case Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="text-lg font-semibold text-text-primary md:col-span-2">Case Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel *
                  </label>
                  <select
                    className="input-field"
                    value={createFormData.channel}
                    onChange={(e) => setCreateFormData({ ...createFormData, channel: e.target.value as any })}
                    required
                  >
                    <option value="WEB">Web</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INFLUENCER">Influencer</option>
                  </select>
                </div>
                
                <Input
                  label="Origin *"
                  value={createFormData.origin}
                  onChange={(e) => setCreateFormData({ ...createFormData, origin: e.target.value })}
                  placeholder="e.g., Website Contact Form, Facebook Ad, etc."
                  required
                />
                
                <Input
                  label="Clinic *"
                  value={createFormData.clinic}
                  onChange={(e) => setCreateFormData({ ...createFormData, clinic: e.target.value })}
                  required
                />
                
                <Input
                  label="Treatment"
                  value={createFormData.treatment}
                  onChange={(e) => setCreateFormData({ ...createFormData, treatment: e.target.value })}
                  placeholder="e.g., LASIK, SMILE, ICL"
                />
                
                <Input
                  label="Promotion"
                  value={createFormData.promotion}
                  onChange={(e) => setCreateFormData({ ...createFormData, promotion: e.target.value })}
                  placeholder="e.g., Spring Special 20%"
                />
                
                <Input
                  label="Disposition"
                  value={createFormData.disposition}
                  onChange={(e) => setCreateFormData({ ...createFormData, disposition: e.target.value })}
                  placeholder="e.g., Interested in consultation, Not interested, etc."
                />
                
                <Input
                  label="Follow-up Date"
                  type="datetime-local"
                  value={createFormData.follow_up_date}
                  onChange={(e) => setCreateFormData({ ...createFormData, follow_up_date: e.target.value })}
                />
                
                <Input
                  label="Dialer Campaign Tag"
                  value={createFormData.dialer_campaign_tag}
                  onChange={(e) => setCreateFormData({ ...createFormData, dialer_campaign_tag: e.target.value })}
                  placeholder="e.g., Q1-Follow-Up"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={creatingCase}>
                  Create Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="input-field"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="IN_CORSO">In Progress</option>
              <option value="APPUNTAMENTO">Appointment</option>
              <option value="CHIUSO">Closed</option>
            </select>
            <select
              className="input-field"
              value={filters.channel || ''}
              onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            >
              <option value="">All Channels</option>
              <option value="WEB">Web</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INFLUENCER">Influencer</option>
            </select>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCaseClick(caseItem.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {caseItem.first_name} {caseItem.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{caseItem.phone}</div>
                      {caseItem.email && (
                        <div className="text-sm text-gray-500">{caseItem.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caseItem.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}
                        value={caseItem.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(caseItem.id, e.target.value as any)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="IN_CORSO">In Progress</option>
                        <option value="APPUNTAMENTO">Appointment</option>
                        <option value="CHIUSO">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem.clinic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(caseItem.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        handleCaseClick(caseItem.id)
                      }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No cases found. Try adjusting your filters or create a new case.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 