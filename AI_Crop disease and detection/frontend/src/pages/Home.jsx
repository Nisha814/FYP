import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiCamera, FiBarChart2, FiShield, FiZap } from 'react-icons/fi'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered Crop Disease Detection
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Detect crop diseases in seconds and get instant treatment recommendations
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Login
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link to="/predict" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 inline-block">
              Start Predicting
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CropGuard AI?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <FiZap className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Detection</h3>
              <p className="text-gray-600">Get results in seconds using advanced CNN technology</p>
            </div>
            <div className="card text-center">
              <FiShield className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Accurate Results</h3>
              <p className="text-gray-600">High-precision disease identification with confidence scores</p>
            </div>
            <div className="card text-center">
              <FiCamera className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simply upload a leaf image and get instant analysis</p>
            </div>
            <div className="card text-center">
              <FiBarChart2 className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">Track your predictions and monitor crop health trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
              <p className="text-gray-600">Take or upload a photo of the crop leaf</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our CNN model analyzes the image for diseases</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
              <p className="text-gray-600">Receive treatment suggestions and preventive measures</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home


