import React from "react"
import { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { settingsContext } from "../contexts/settingsContext";

export default function ScoreTable({teamData, refreshData}){
    const [mutapleTeamData, setMutapleTeamData] = useState([...teamData])
    const [settings, setSettings] = useContext(settingsContext)
    const [divisorHeader, setDivisorHeader] = useState("")
    const [mapIndex, setMapIndex] = useState(0);
    const size = 10;
    

    useEffect(() => {
        let temp = ""

        if(settings.divisor <= 1){
            temp = "Top Score"
        }

        else if(settings.divisor >= 999){
            temp = "Average Score"
        }

        else {
            temp = `Average of Top ${settings.divisor} Scores`
        }



        setDivisorHeader(temp);

    }, [settings])

    useEffect(() => {
        let teams = teamData.map((item, index) => {
            let temp = {
                number: item.number,
                name: item.name,
                scores: item.scores.toString(),
            }
            
            if(item.scores.length > 0){
                let orderScores = [...item.scores].sort((a,b) => a-b).reverse().slice(0, settings.divisor);
                orderScores = orderScores.reduce((a,b) => a+b) / orderScores.length;
                console.log(orderScores)
                temp["average"] = orderScores;
                temp["displayAverage"] = orderScores.toFixed(3)    
            } else {
                temp["average"] = -1
                temp["displayAverage"] = -1
            }
            return temp
        })

        teams = teams.sort(function (a, b){
            return b.average - a.average
        })

        teams = teams.map((item, index) => {
            item["place"] = index + 1
            return item
        })

        console.log(teams)
        
        setMutapleTeamData(
            teams
        )
    }, [teamData])

    useEffect(() => {
        const timeout = setTimeout(() => {
            let temp = mapIndex + size
            if(temp > mutapleTeamData.length){
                temp = 0
                refreshData()
            }
            setMapIndex(temp)
        }, size * 1e3)
        return () => clearTimeout(timeout)
    }, [mutapleTeamData, mapIndex])

    return <>
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Place</th>
                    <th>Team Number</th>
                    <th>Team Name</th>
                    <th>Scores</th>
                    <th>{divisorHeader}</th>
                </tr>
            </thead>
            <tbody>
                {
                mutapleTeamData.map((item, index) => {
                    return <tr key={index}>
                        <td>{item['place']}</td>
                        <td>{item['number']}</td>
                        <td>{item['name']}</td>
                        <td>{item['scores']}</td>
                        <td>{item["displayAverage"]}</td>
                    </tr>
                }).splice(mapIndex, size)}
            </tbody>
        </Table>
    </>
}