import Link from 'next/link';
import './page.css';

export default function HomePage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to Your App</h1>
        <p className="landing-description">
          A production-ready Next.js application scaffolded with create-react-forge.
        </p>
        <div className="landing-buttons">
          <Link href="/dashboard" className="btn btn-primary">
            Get started
          </Link>
          <a
            href="https://github.com/alan2207/bulletproof-react"
            className="btn btn-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}



