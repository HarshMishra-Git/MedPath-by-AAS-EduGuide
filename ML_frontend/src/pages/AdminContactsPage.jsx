import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  Mail,
  Phone,
  Building,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Inbox,
  TrendingUp,
  Users,
  MessageSquare,
  RefreshCw
} from 'lucide-react'

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

const AdminContactsPage = () => {
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${AUTH_API_BASE_URL}/contact/stats`, getAuthHeaders())
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    }
  }

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = filterStatus !== 'all' ? { status: filterStatus } : {}
      const response = await axios.get(`${AUTH_API_BASE_URL}/contact/submissions`, {
        params,
        ...getAuthHeaders()
      })
      setSubmissions(response.data.data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load contact submissions')
    } finally {
      setLoading(false)
    }
  }

  // Update submission status
  const updateStatus = async (id, status, notes = '') => {
    try {
      await axios.patch(
        `${AUTH_API_BASE_URL}/contact/submissions/${id}`,
        {
          status,
          notes,
          resolvedBy: 'Admin'
        },
        getAuthHeaders()
      )
      toast.success('Status updated successfully')
      fetchSubmissions()
      fetchStats()
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  useEffect(() => {
    fetchSubmissions()
    fetchStats()
  }, [filterStatus, refreshKey])

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Contact Submissions
          </h1>
          <p className="text-gray-600">
            Manage and respond to contact form submissions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={Inbox}
              label="Total Submissions"
              value={stats.total}
              color="blue"
            />
            <StatsCard
              icon={Clock}
              label="Pending"
              value={stats.byStatus.pending}
              color="yellow"
            />
            <StatsCard
              icon={TrendingUp}
              label="In Progress"
              value={stats.byStatus.inProgress}
              color="purple"
            />
            <StatsCard
              icon={CheckCircle}
              label="Resolved"
              value={stats.byStatus.resolved}
              color="green"
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No submissions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <SubmissionRow
                      key={submission.id}
                      submission={submission}
                      onView={() => setSelectedSubmission(submission)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submission Detail Modal */}
        <AnimatePresence>
          {selectedSubmission && (
            <SubmissionModal
              submission={selectedSubmission}
              onClose={() => setSelectedSubmission(null)}
              onUpdateStatus={updateStatus}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// Submission Row Component
const SubmissionRow = ({ submission, onView }) => {
  const statusConfig = {
    PENDING: { color: 'yellow', icon: Clock, label: 'Pending' },
    IN_PROGRESS: { color: 'blue', icon: TrendingUp, label: 'In Progress' },
    RESOLVED: { color: 'green', icon: CheckCircle, label: 'Resolved' },
    CLOSED: { color: 'gray', icon: XCircle, label: 'Closed' }
  }

  const status = statusConfig[submission.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{submission.name}</p>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <Mail className="w-3 h-3 mr-1" />
            {submission.email}
          </p>
          {submission.phone && (
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Phone className="w-3 h-3 mr-1" />
              {submission.phone}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-gray-900">{submission.subject}</p>
        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
          {submission.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatDate(submission.submittedAt)}
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onView}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>
      </td>
    </tr>
  )
}

// Submission Detail Modal Component
const SubmissionModal = ({ submission, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(submission.status)
  const [notes, setNotes] = useState(submission.notes || '')
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    await onUpdateStatus(submission.id, status, notes)
    setUpdating(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Contact Submission Details
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <span className="font-medium">{submission.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <a href={`mailto:${submission.email}`} className="text-primary-600 hover:underline">
                  {submission.email}
                </a>
              </div>
              {submission.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`tel:${submission.phone}`} className="text-primary-600 hover:underline">
                    {submission.phone}
                  </a>
                </div>
              )}
              {submission.organization && (
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{submission.organization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subject & Category */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Subject & Category
            </h3>
            <div className="space-y-2">
              <p className="font-medium text-lg">{submission.subject}</p>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded">
                {submission.category}
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Message
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Status & Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add notes about this submission..."
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
              {submission.resolvedAt && (
                <p><strong>Resolved:</strong> {new Date(submission.resolvedAt).toLocaleString()}</p>
              )}
              {submission.resolvedBy && (
                <p><strong>Resolved By:</strong> {submission.resolvedBy}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-medical-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminContactsPage
