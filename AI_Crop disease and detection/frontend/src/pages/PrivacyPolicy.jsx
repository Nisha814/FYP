import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout'

const PrivacyPolicy = () => (
  <InfoPageLayout title="Privacy Policy">
    <p className="text-sm text-gray-500">Last updated: May 2026</p>
    <p>
      This Privacy Policy describes how CropGuard AI (the &quot;application&quot;) handles
      information when you use our crop disease detection and recommendation features.
      It is intended for demonstration and coursework (final year project) purposes.
    </p>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">Information we collect</h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>Account details you choose to provide such as username and email.</li>
      <li>Crop images and prediction requests you submit for disease analysis.</li>
      <li>Basic usage logs required to operate notifications and dashboards where enabled.</li>
    </ul>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">How we use your information</h2>
    <p>
      Images and related metadata are processed to produce disease predictions and
      suggestions. Aggregate statistics may appear in analytics features available to your
      account.
    </p>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">Sharing</h2>
    <p>
      We do not sell your personal data. Data may be transmitted to backend services you
      or your administrator deploy alongside this project; configure those environments
      according to your own policies.
    </p>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">Retention</h2>
    <p>
      Retention depends on how the paired backend/database is configured. Remove your
      account or delete records there if your deployment requires deletion.
    </p>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">Security</h2>
    <p>
      Reasonable safeguards are recommended for deployment (HTTPS, secrets management).
      Treat demo deployments as non-production unless properly hardened.
    </p>

    <h2 className="text-xl font-semibold text-gray-900 pt-4">Contact</h2>
    <p>
      For privacy questions relating to your deployment of this application, contact the
      project maintainer listed in your course or organization.
    </p>

    <p className="pt-6">
      <Link to="/" className="text-primary-600 font-medium hover:underline">
        ← Back to home
      </Link>
    </p>
  </InfoPageLayout>
)

export default PrivacyPolicy
