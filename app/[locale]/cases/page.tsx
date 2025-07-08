'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, getCurrentLocale } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { fetchCases, updateCaseStatus } from '@/lib/api'
import type { Case, CaseFilters } from '@/types'

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [filters, setFilters] = useState<CaseFilters>({})
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
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
        c.phone.includes(searchLower)
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

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting cases:', filteredCases)
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
                Export CSV
              </Button>
              <Button>
                New Case
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Channel</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Created</th>
                  <th className="table-header">Follow Up</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="table-cell font-medium text-primary">
                      #{caseItem.id}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-text-primary">
                          {caseItem.first_name} {caseItem.last_name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {caseItem.clinic}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="text-text-primary">{caseItem.phone}</div>
                        {caseItem.email && (
                          <div className="text-sm text-text-secondary">{caseItem.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {caseItem.channel}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-text-secondary">
                      {formatDate(caseItem.created_at)}
                    </td>
                    <td className="table-cell text-sm text-text-secondary">
                      {caseItem.follow_up_date ? formatDate(caseItem.follow_up_date) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No cases found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 