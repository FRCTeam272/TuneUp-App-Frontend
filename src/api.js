export class Team_API_Client {
    base_url = (process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com') + "/team/";

    // Default fetch options with CORS support
    getDefaultOptions(method = "GET", body = null) {
        const options = {
            method,
            mode: 'cors', // Enable CORS
            credentials: 'omit', // Don't send cookies for cross-origin requests
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return options;
    }

    getAllTeams() {
        return fetch(this.base_url, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    createTeam(name, id, password) {
        return fetch(this.base_url, this.getDefaultOptions("POST", { name, id, password }))
            .then((response) => response.json());
    }

    getSpecificTeam(team_id) {
        return fetch(`${this.base_url}/${team_id}`, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    deleteTeam(team_id, password) {
        return fetch(`${this.base_url}/delete`, this.getDefaultOptions("POST", { team_id, password }))
            .then((response) => response.json());
    }

    editTeam(team_id, name, password) {
        return fetch(`${this.base_url}rename`, this.getDefaultOptions("POST", { team_id, name, password }))
            .then((response) => response.json());
    }

    getRanks(){
        return fetch(`${this.base_url}get_ranks`, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    getSchedule(team_id){
        return fetch(`${this.base_url}get_events`, this.getDefaultOptions("POST", { team_id }))
            .then((response) => response.json());
    }
}

export class Score_API_Client {
    base_url = (process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com') + "/score/";

    // Default fetch options with CORS support
    getDefaultOptions(method = "GET", body = null) {
        const options = {
            method,
            mode: 'cors', // Enable CORS
            credentials: 'omit', // Don't send cookies for cross-origin requests
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return options;
    }

    addScore(team_id, score, password) {
        return fetch(this.base_url, this.getDefaultOptions("POST", { team_id, score, password }))
            .then((response) => response.json());
    }

    removeScore(team_id, score, password) {
        return fetch(this.base_url + "delete", this.getDefaultOptions("POST", { team_id, score, password }))
            .then((response) => response.json());
    }

    removeScoreById(scoreId, password) {
        return fetch(this.base_url + "removeById", this.getDefaultOptions("POST", { scoreId, password }))
            .then((response) => response.json());
    }
}

export class Display_API_Client {
    base_url = (process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com') + "/display/";

    // Default fetch options with CORS support
    getDefaultOptions(method = "GET", body = null) {
        const options = {
            method,
            mode: 'cors', // Enable CORS
            credentials: 'omit', // Don't send cookies for cross-origin requests
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return options;
    }

    getDisplay() {
        return fetch(this.base_url, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    getDisplayById(teamId) {
        return fetch(`${this.base_url}${teamId}`, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    checkDisplayPassword(password) {
        return fetch(this.base_url + 'check_password', this.getDefaultOptions("POST", { password }))
            .then((response) => response.json());
    }
}

export class Schedule_API_Client {
    base_url = (process.env.GATSBY_BACKEND_URL || 'https://tuneup-backend-7cb9db42de78.herokuapp.com') + "/schedule";

    // Default fetch options with CORS support
    getDefaultOptions(method = "GET", body = null) {
        const options = {
            method,
            mode: 'cors', // Enable CORS
            credentials: 'omit', // Don't send cookies for cross-origin requests
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        return options;
    }

    getSchedule() {
        return fetch(this.base_url, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }

    getRooms() {
        return fetch(`${this.base_url}/rooms`, this.getDefaultOptions("GET"))
            .then((response) => response.json());
    }
}