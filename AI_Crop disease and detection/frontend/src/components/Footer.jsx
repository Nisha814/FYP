import { Link } from 'react-router-dom'
import { FiGithub, FiMail, FiLinkedin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">🌱 CropGuard AI</h3>
            <p className="text-gray-400 mb-4">
              AI-Powered Crop Disease Detection and Recommendation System. 
              Helping farmers make data-driven decisions for better crop health.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/info/github"
                className="text-gray-400 hover:text-white transition-colors"
                title="GitHub — sign in on GitHub’s site"
                aria-label="GitHub information and sign-in"
              >
                <FiGithub className="text-xl" />
              </Link>
              <Link
                to="/info/email"
                className="text-gray-400 hover:text-white transition-colors"
                title="Web mail — sign in with your provider"
                aria-label="Email and web mail sign-in"
              >
                <FiMail className="text-xl" />
              </Link>
              <Link
                to="/info/linkedin"
                className="text-gray-400 hover:text-white transition-colors"
                title="LinkedIn — sign in on LinkedIn’s site"
                aria-label="LinkedIn information and sign-in"
              >
                <FiLinkedin className="text-xl" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/predict" className="text-gray-400 hover:text-white transition-colors">
                  Predict Disease
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-400 hover:text-white transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/api-reference" className="text-gray-400 hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CropGuard AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

