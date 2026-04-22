import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionService } from '../services/api'
import { FiCamera, FiTrendingUp, FiActivity, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    recentPredictions: 0,
    healthyCount: 0,
    diseasedCount: 0
  })
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [predictionsRes, analyticsRes] = await Promise.all([
        predictionService.getPredictions(),
        predictionService.getAnalytics()
      ])

      setStats(analyticsRes.data.analytics)
      setRecentPredictions(predictionsRes.data.predictions.slice(0, 5))
    } catch (error) {
      toast.error('Failed to load dashboard data')
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your crop health overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPredictions}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiCamera className="text-primary-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent (30 days)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.recentPredictions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiTrendingUp className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy Plants</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.healthyCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiActivity className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diseased Plants</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.diseasedCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiAlertCircle className="text-red-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/predict"
              className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center">
                <FiCamera className="text-primary-600 text-xl mr-3" />
                <span className="font-medium">New Prediction</span>
              </div>
              <span className="text-primary-600">→</span>
            </Link>
            <Link
              to="/history"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <FiActivity className="text-gray-600 text-xl mr-3" />
                <span className="font-medium">View History</span>
              </div>
              <span className="text-gray-600">→</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <FiTrendingUp className="text-gray-600 text-xl mr-3" />
                <span className="font-medium">View Analytics</span>
              </div>
              <span className="text-gray-600">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Predictions</h2>
          {recentPredictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCamera className="text-4xl mx-auto mb-2 text-gray-300" />
              <p>No predictions yet</p>
              <Link to="/predict" className="text-primary-600 hover:underline mt-2 inline-block">
                Make your first prediction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPredictions.map((prediction) => (
                <Link
                  key={prediction._id}
                  to={`/history`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{prediction.plantType}</p>
                      <p className="text-sm text-gray-600">{prediction.diseaseDetected}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          prediction.isHealthy
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prediction.isHealthy ? 'Healthy' : 'Diseased'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

