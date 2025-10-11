export async function apiStatus(apiUrl){
    return await fetch(`${apiUrl}/`, {
        method: "GET",
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "127.0.0.1/5000",
            "Access-Control-Request-Headers": 'Content-Type, Authorization'
        }
    })
}

export async function getTeams(apiUrl){
    return await fetch(`${apiUrl}/getTeams`, {
        method: 'GET',
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "127.0.0.1/5000",
            "Access-Control-Request-Headers": 'Content-Type, Authorization'
        }
    })
}

export async function getTeam(apiUrl, teamNumber){
    return await fetch(`${apiUrl}/getTeam/${teamNumber}`, {
        method: 'GET',
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "127.0.0.1/5000",
            "Access-Control-Request-Headers": 'Content-Type, Authorization'
        }
    })
}

export async function addScore(apiUrl, teamNumber, score){
    return await fetch(`${apiUrl}/addScore/${teamNumber}/${score}`, {
        method: 'POST',
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "127.0.0.1/5000",
            "Access-Control-Request-Headers": 'Content-Type, Authorization'
        }
    })
}

export async function updateTeam(apiUrl, teamNumber, teamName, scores){
    return await fetch(`${apiUrl}`, {
        method: "POST",
        body: {
            number: teamNumber,
            name: teamName,
            scores: scores
        }
    })
}

export async function removeTeam(apiUrl, teamNumber){
    return await fetch(`${apiUrl}/removeTeam/${teamNumber}`, {
        method: "DELETE",
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "127.0.0.1/5000",
            "Access-Control-Request-Headers": 'Content-Type, Authorization'
        }
    })
}