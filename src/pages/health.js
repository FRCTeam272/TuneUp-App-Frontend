import * as React from "react"

const HealthCheckPage = () => {
  const [healthStatus, setHealthStatus] = React.useState('checking');
  const [backendStatus, setBackendStatus] = React.useState('checking');
  const [envVars, setEnvVars] = React.useState({});

  React.useEffect(() => {
    // Check environment variables
    const vars = {
      GATSBY_BACKEND_URL: process.env.GATSBY_BACKEND_URL,
      GATSBY_TIMER: process.env.GATSBY_TIMER,
      GATSBY_SHOW_FORM: process.env.GATSBY_SHOW_FORM,
      GATSBY_DIVISOR: process.env.GATSBY_DIVISOR,
      GATSBY_CORS_ENABLED: process.env.GATSBY_CORS_ENABLED,
      NODE_ENV: process.env.NODE_ENV
    };
    setEnvVars(vars);

    // Basic health check
    setHealthStatus('ok');

    // Check backend connectivity
    if (typeof window !== 'undefined' && process.env.GATSBY_BACKEND_URL) {
      fetch(process.env.GATSBY_BACKEND_URL + '/health')
        .then(response => {
          if (response.ok) {
            setBackendStatus('ok');
          } else {
            setBackendStatus('error - HTTP ' + response.status);
          }
        })
        .catch(error => {
          setBackendStatus('error - ' + error.message);
        });
    } else {
      setBackendStatus('skipped - no backend URL or SSR');
    }
  }, []);

  return (
    <div className="container mt-5">
      <h1>FLL Scoreboard - Health Check</h1>
      
      <div className="mt-4">
        <h3>System Status</h3>
        <ul className="list-group">
          <li className={`list-group-item ${healthStatus === 'ok' ? 'list-group-item-success' : 'list-group-item-warning'}`}>
            Frontend: {healthStatus}
          </li>
          <li className={`list-group-item ${backendStatus === 'ok' ? 'list-group-item-success' : backendStatus.includes('error') ? 'list-group-item-danger' : 'list-group-item-warning'}`}>
            Backend: {backendStatus}
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <h3>Environment Variables</h3>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key}>
                  <td><code>{key}</code></td>
                  <td><code>{value || 'undefined'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <h3>Browser Info</h3>
        {typeof window !== 'undefined' ? (
          <ul className="list-group">
            <li className="list-group-item">User Agent: {navigator.userAgent}</li>
            <li className="list-group-item">URL: {window.location.href}</li>
            <li className="list-group-item">Local Storage Available: {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}</li>
          </ul>
        ) : (
          <p>Running in SSR mode</p>
        )}
      </div>

      <div className="mt-4">
        <a href="/" className="btn btn-primary">← Back to Home</a>
      </div>
    </div>
  );
}

export default HealthCheckPage

export const Head = () => <title>Health Check - FLL Scoreboard</title>