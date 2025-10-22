// Enhanced API client with better CORS and error handling
class BaseApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    // Enhanced fetch with better CORS support and error handling
    async fetchWithCors(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            mode: 'cors',
            credentials: 'omit', // Don't send cookies for cross-origin requests
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Add any custom headers if needed
                ...(options.headers || {})
            },
        };

        // Merge provided options with defaults
        const fetchOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        try {
            console.log(`🌐 Making ${fetchOptions.method || 'GET'} request to: ${url}`);
            
            const response = await fetch(url, fetchOptions);
            
            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Request failed:', error);
            
            // Handle specific CORS errors
            if (error.message.includes('CORS')) {
                throw new Error('Cross-origin request blocked. Please ensure your backend allows CORS from this domain.');
            }
            
            // Handle network errors
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection and backend availability.');
            }
            
            throw error;
        }
    }

    // GET request helper
    get(endpoint) {
        return this.fetchWithCors(endpoint, { method: 'GET' });
    }

    // POST request helper
    post(endpoint, data) {
        return this.fetchWithCors(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request helper
    put(endpoint, data) {
        return this.fetchWithCors(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request helper
    delete(endpoint, data = null) {
        const options = { method: 'DELETE' };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return this.fetchWithCors(endpoint, options);
    }
}

// Enhanced API clients using the base class
export class EnhancedTeamApiClient extends BaseApiClient {
    constructor() {
        super(process.env.GATSBY_BACKEND_URL + "/team");
    }

    getAllTeams() {
        return this.get('/');
    }

    createTeam(name, id, password) {
        return this.post('/', { name, id, password });
    }

    getSpecificTeam(team_id) {
        return this.get(`/${team_id}`);
    }

    deleteTeam(team_id, password) {
        return this.post('/delete', { team_id, password });
    }

    editTeam(team_id, name, password) {
        return this.post('/rename', { team_id, name, password });
    }
}

export class EnhancedScoreApiClient extends BaseApiClient {
    constructor() {
        super(process.env.GATSBY_BACKEND_URL + "/score");
    }

    addScore(team_id, score, password) {
        return this.post('/', { team_id, score, password });
    }

    removeScore(team_id, score, password) {
        return this.post('/delete', { team_id, score, password });
    }

    removeScoreById(scoreId, password) {
        return this.post('/removeById', { scoreId, password });
    }
}

export class EnhancedDisplayApiClient extends BaseApiClient {
    constructor() {
        super(process.env.GATSBY_BACKEND_URL + "/display");
    }

    getDisplay() {
        return this.get('/');
    }

    getDisplayById(teamId) {
        return this.get(`/${teamId}`);
    }

    checkDisplayPassword(password) {
        return this.post('/check_password', { password });
    }
}

export default BaseApiClient;