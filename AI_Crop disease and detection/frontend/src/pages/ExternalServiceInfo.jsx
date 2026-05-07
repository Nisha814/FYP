import { Link, useParams } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout'

const SECTIONS = {
  email: {
    title: 'Web mail',
    intro:
      'The mail icon links to the web version of your mailbox. You must sign in with your own email provider before you can read or send messages—we do not embed your inbox inside CropGuard AI.',
    bullets: [
      'Use the same email and password (or SSO) you normally use for that provider.',
      'After signing in, you stay on the provider’s website; your session is managed only by them.',
    ],
    links: [
      { href: 'https://mail.google.com/', label: 'Open Gmail (sign in there)' },
      { href: 'https://outlook.live.com/', label: 'Open Outlook (sign in there)' },
    ],
  },
  github: {
    title: 'GitHub',
    intro:
      'GitHub hosts code and collaboration. To star, fork, or interact with repositories, open GitHub below and sign in (or create an account) on GitHub’s own login page.',
    bullets: [
      'CropGuard AI cannot log you into GitHub for you—you complete authentication on github.com.',
      'Use two-factor authentication where available for your GitHub account.',
    ],
    links: [
      { href: 'https://github.com/login', label: 'Sign in on GitHub' },
      { href: 'https://github.com/signup', label: 'Create a GitHub account' },
    ],
  },
  linkedin: {
    title: 'LinkedIn',
    intro:
      'LinkedIn is used for professional profiles and networking. Open LinkedIn below and sign in on their site if you want to connect with the project team or share updates.',
    bullets: [
      'Signing in happens only on linkedin.com.',
      'Adjust privacy settings on LinkedIn itself for who can see your activity.',
    ],
    links: [
      { href: 'https://www.linkedin.com/login', label: 'Sign in on LinkedIn' },
      { href: 'https://www.linkedin.com/signup', label: 'Join LinkedIn' },
    ],
  },
}

const ExternalServiceInfo = () => {
  const { service } = useParams()
  const config = SECTIONS[service]
  if (!config) {
    return (
      <InfoPageLayout title="Page not found">
        <p>This information page is unavailable.</p>
        <Link to="/" className="text-primary-600 font-medium hover:underline">
          ← Back to home
        </Link>
      </InfoPageLayout>
    )
  }

  return (
    <InfoPageLayout title={config.title}>
      <p>{config.intro}</p>
      <ul className="list-disc pl-6 space-y-2">
        {config.bullets.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {config.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className="text-sm text-gray-500 pt-4">
        Prefer your desktop app? You can also use your system mail client if it is
        configured separately; this page is only for explaining the web shortcuts in the
        footer.
      </p>
      <p className="pt-6">
        <Link to="/" className="text-primary-600 font-medium hover:underline">
          ← Back to home
        </Link>
      </p>
    </InfoPageLayout>
  )
}

export default ExternalServiceInfo
