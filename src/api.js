export class Team_API_Client {
    base_url = process.env.GATSBY_BACKEND_URL + "/team/";

    getAllTeams() {
        return fetch(this.base_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"

            },
        }).then((response) => response.json());
    }

    createTeam(name, id, password) {
        return fetch(this.base_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, id, password })
        }).then((response) => response.json());
    }

    getSpecificTeam(teamId) {
        return fetch(`${this.base_url}/${teamId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json());
    }

    deleteTeam(teamId, password) {
        return fetch(`${this.base_url}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ teamId, password })
        }).then((response) => response.json());
    }
}

export class Score_API_Client {
    base_url = process.env.GATSBY_BACKEND_URL + "/score/";

    addScore(team_id, score, password) {
        return fetch(this.base_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ team_id, score, password })
        }).then((response) => response.json());
    }

    removeScore(teamId, score, password) {
        return fetch(this.base_url + "delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ teamId, score, password })
        }).then((response) => response.json());
    }

    removeScoreById(scoreId, password) {
        return fetch(this.base_url + "removeById", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ scoreId, password })
        }).then((response) => response.json());
    }
}

export class Display_API_Client {
    base_url = process.env.GATSBY_BACKEND_URL + "/display/";

    getDisplay() {
        return fetch(this.base_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }).then((response) => response.json());
    }

    getDisplayById(teamId) {
        return fetch(`${this.base_url}${teamId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }).then((response) => response.json());
    }

    checkDisplayPassword(password) {
        return fetch(this.base_url + 'check_password', {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        }).then((response) => response.json());
    }
}