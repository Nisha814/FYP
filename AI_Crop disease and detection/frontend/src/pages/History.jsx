import { useEffect, useState } from 'react'
import { predictionService } from '../services/api'
import { FiTrash2, FiEye, FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const History = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, healthy, diseased

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const response = await predictionService.getPredictions()
      setPredictions(response.data.predictions)
    } catch (error) {
      toast.error('Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) {
      return
    }

    try {
      await predictionService.deletePrediction(id)
      setPredictions(predictions.filter((p) => p._id !== id))
      toast.success('Prediction deleted successfully')
    } catch (error) {
      toast.error('Failed to delete prediction')
    }
  }

  const filteredPredictions = predictions.filter((prediction) => {
    if (filter === 'healthy') return prediction.isHealthy
    if (filter === 'diseased') return !prediction.isHealthy
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
          <p className="mt-2 text-gray-600">View all your crop disease predictions</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({predictions.length})
          </button>
          <button
            onClick={() => setFilter('healthy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'healthy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Healthy ({predictions.filter((p) => p.isHealthy).length})
          </button>
          <button
            onClick={() => setFilter('diseased')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'diseased'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Diseased ({predictions.filter((p) => !p.isHealthy).length})
          </button>
        </div>
      </div>

      {filteredPredictions.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">No predictions found</p>
          <a href="/predict" className="text-primary-600 hover:underline">
            Make your first prediction
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction) => (
            <div key={prediction._id} className="card hover:shadow-lg transition-shadow">
              <div className="relative mb-4">
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${prediction.imageUrl}`}
                  alt={prediction.plantType}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
                  }}
                />
                <div className="absolute top-2 right-2">
                  {prediction.isHealthy ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiCheckCircle className="mr-1" />
                      Healthy
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiAlertCircle className="mr-1" />
                      Diseased
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Plant Type</p>
                  <p className="font-semibold text-gray-900">{prediction.plantType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Disease Detected</p>
                  <p className="font-semibold text-gray-900">{prediction.diseaseDetected}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="font-medium">{prediction.confidence}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-xs text-gray-500">
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Treatments:</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                      >
                        {rec.treatmentType}
                      </span>
                    ))}
                    {prediction.recommendations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{prediction.recommendations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() => handleDelete(prediction._id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History

