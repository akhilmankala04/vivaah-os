import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' or 'production'
  enabled: import.meta.env.PROD, // Only active in production builds
  tracesSampleRate: 0.1, // 10% of transactions
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <p className="text-[17px] font-medium text-gray-900 mb-2">Something went wrong</p>
            <p className="text-[15px] text-gray-500 mb-4">
              The team has been notified. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-vivaah-600 text-white h-11 px-5 rounded-xl font-medium w-full"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
