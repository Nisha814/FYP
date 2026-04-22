import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictionService } from '../services/api'
import { FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import ImageUpload from '../components/ImageUpload'
import toast from 'react-hot-toast'

const Predict = () => {
  const [image, setImage] = useState(null)
  const [plantType, setPlantType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleImageSelect = (file) => {
    setImage(file)
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) {
      toast.error('Please select an image')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      if (plantType) {
        formData.append('plantType', plantType)
      }

      const response = await predictionService.createPrediction(formData)
      setResult(response.data.prediction)
      toast.success('Prediction completed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to predict disease')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
        <p className="mt-2 text-gray-600">Upload a leaf image to detect diseases and get treatment recommendations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Type (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Tomato, Potato, Corn"
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leaf Image
              </label>
              <ImageUpload onImageSelect={handleImageSelect} />
            </div>

            <button
              type="submit"
              disabled={!image || loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiCamera className="mr-2" />
                  Detect Disease
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
          {!result ? (
            <div className="text-center py-12 text-gray-500">
              <FiCamera className="text-6xl mx-auto mb-4 text-gray-300" />
              <p>Upload an image to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Disease Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Detected Disease</h3>
                  {result.isHealthy ? (
                    <span className="flex items-center text-green-600">
                      <FiCheckCircle className="mr-1" />
                      Healthy
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <FiAlertCircle className="mr-1" />
                      Diseased
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{result.diseaseDetected}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Treatment Recommendations</h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                            {rec.treatmentType}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{rec.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p><strong>Application:</strong> {rec.application}</p>
                          <p><strong>Dosage:</strong> {rec.dosage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/history')}
                className="w-full btn-secondary"
              >
                View Full History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Predict

