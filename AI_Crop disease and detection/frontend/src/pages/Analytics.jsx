import { useEffect, useState } from 'react'
import { predictionService } from '../services/api'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FiTrendingUp, FiActivity } from 'react-icons/fi'
import toast from 'react-hot-toast'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await predictionService.getAnalytics()
      setAnalytics(response.data.analytics)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <FiActivity className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  const diseaseData = (analytics?.diseaseDistribution || []).map((item) => ({
    name: item._id || 'Unknown',
    value: item.count || 0
  }))

  const plantData = (analytics?.plantTypeDistribution || []).map((item) => ({
    name: item._id || 'Unknown',
    value: item.count || 0
  }))

  const healthData = [
    { name: 'Healthy', value: analytics?.healthyCount || 0, color: '#22c55e' },
    { name: 'Diseased', value: analytics?.diseasedCount || 0, color: '#ef4444' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Visual insights into your crop health predictions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalPredictions}</p>
            </div>
            <FiActivity className="text-3xl text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent (30 days)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.recentPredictions}</p>
            </div>
            <FiTrendingUp className="text-3xl text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy Plants</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{analytics.healthyCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diseased Plants</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{analytics.diseasedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Disease Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Disease Distribution</h2>
          {diseaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>

        {/* Health Status */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Health Status</h2>
          {healthData[0].value > 0 || healthData[1].value > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Plant Type Distribution */}
      {plantData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Plant Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={plantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default Analytics

