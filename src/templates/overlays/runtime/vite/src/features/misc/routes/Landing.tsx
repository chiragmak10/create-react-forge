import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Your App
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A production-ready React application scaffolded with react-setup.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/dashboard"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
          </Link>
          <a
            href="https://github.com/alan2207/bulletproof-react"
            className="text-sm font-semibold leading-6"
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

