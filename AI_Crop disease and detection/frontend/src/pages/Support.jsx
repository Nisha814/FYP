import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout'

const Support = () => (
  <InfoPageLayout title="Support">
    <p>
      If CropGuard AI is slow to load or predictions fail, work through these checks before
      escalating:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Confirm both frontend (Vite dev or static build) and backend API are running.</li>
      <li>Ensure images are JPG/PNG and under reasonable file size limits.</li>
      <li>Clear your browser cache if you switched between dev and production builds.</li>
      <li>Watch the browser network tab for 401/500 responses and error messages from the API.</li>
    </ul>
    <p>
      For coursework, document any blocking issue with screenshots and request help from
      your supervisor or lab assistant with those details.
    </p>
    <p className="pt-6">
      <Link to="/" className="text-primary-600 font-medium hover:underline">
        ← Back to home
      </Link>
    </p>
  </InfoPageLayout>
)

export default Support
