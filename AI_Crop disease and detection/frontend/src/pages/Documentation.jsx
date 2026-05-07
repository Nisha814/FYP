import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout'

const Documentation = () => (
  <InfoPageLayout title="Documentation">
    <p>
      CropGuard AI helps farmers and agronomists upload crop imagery, run disease checks,
      and review history alongside optional social and notification features depending on
      how your instructor or team enables the backend.
    </p>
    <h2 className="text-xl font-semibold text-gray-900 pt-4">Getting started</h2>
    <ol className="list-decimal pl-6 space-y-2">
      <li>Create an account via Register, or sign in if you already have one.</li>
      <li>Ensure the API server from the paired backend repository is running (often on port 5000).</li>
      <li>Use Predict with a clear photo of leaf or fruit symptoms for the best score.</li>
      <li>Review History for past runs and Analytics for summarized trends.</li>
    </ol>
    <h2 className="text-xl font-semibold text-gray-900 pt-4">Technical stack</h2>
    <p>
      The web client uses React with Vite, Tailwind utility classes for layout, and
      axios/socket clients for REST and realtime updates where implemented.
    </p>
    <p className="pt-6">
      <Link to="/" className="text-primary-600 font-medium hover:underline">
        ← Back to home
      </Link>
    </p>
  </InfoPageLayout>
)

export default Documentation
