import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout'

const ApiReference = () => (
  <InfoPageLayout title="API reference">
    <p>
      The browser talks to REST endpoints under{' '}
      <code className="bg-gray-100 px-1 rounded">/api</code>. When you run{' '}
      <code className="bg-gray-100 px-1 rounded">npm run dev</code>, the frontend sends requests
      to <code className="bg-gray-100 px-1 rounded">/api</code> on the Vite dev port, and Vite
      proxies those to <code className="bg-gray-100 px-1 rounded">http://localhost:5000</code>{' '}
      (see <code className="bg-gray-100 px-1 rounded">vite.config.js</code>).{' '}
      <code className="bg-gray-100 px-1 rounded">npm run preview</code> can use the same{' '}
      <code className="bg-gray-100 px-1 rounded">/api</code> proxy. A plain Live Server / static{' '}
      <code className="bg-gray-100 px-1 rounded">dist/</code> build calls{' '}
      <code className="bg-gray-100 px-1 rounded">http://localhost:5000/api</code> unless you set{' '}
      <code className="bg-gray-100 px-1 rounded">VITE_API_URL</code>.
    </p>
    <h2 className="text-xl font-semibold text-gray-900 pt-4">Common routes</h2>
    <ul className="list-disc pl-6 space-y-2 font-mono text-sm">
      <li>POST /api/auth/register — Register a user</li>
      <li>POST /api/auth/login — Obtain a session/token</li>
      <li>POST /api/predictions — Multipart image upload (protected)</li>
      <li>GET /api/predictions — List past predictions (protected)</li>
      <li>GET /api/predictions/analytics/stats — Summary stats (protected)</li>
    </ul>
    <p className="text-sm text-gray-500">
      Exact paths and payloads must match your deployed backend implementation; inspect
      those route files in your server codebase for authoritative schemas.
    </p>
    <p className="pt-6">
      <Link to="/" className="text-primary-600 font-medium hover:underline">
        ← Back to home
      </Link>
    </p>
  </InfoPageLayout>
)

export default ApiReference
