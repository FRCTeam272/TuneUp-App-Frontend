import * as React from "react"
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Timer from '../components/Timer';
import Settings from '../components/Settings';
import InputForm from '../components/InputForm'
import {getTeams} from '../api'
import ScoreTable from '../components/ScoreTable';
import styled from 'styled-components';
import TeamLookUp from '../components/Lookup';
import { settingsContext } from '../contexts/settingsContext';
import '../App.css';

const FloatContainer = styled.div`
  padding: 20px;
`

const FloatChild = styled.div`
  width: 50%;
  float: left;
  padding: 20px;
`

const IndexPage = () => {
  const [settings, setSettings] = useState(
    {
      timer: "2:30",
      showForm: true,
      backendUrl: "http://127.0.0.1:5000",
      divisor: 3
    }
  )

  const offset = settings.showForm ? 80 : 100

  const [teamData, setTeamData] = useState([])
  
  function refreshData(){
    getTeams(settings.backendUrl)
    .then((res) => res.json())
    .then((res) => setTeamData(res))
  }

  useEffect(() => {
    refreshData()
  }, [])

  return <settingsContext.Provider value={[settings, setSettings]}>
    <Timer></Timer>
    <FloatContainer>
      <FloatChild style={{width: `${offset}%`}}>
        <ScoreTable teamData={teamData} refreshData={refreshData}></ScoreTable>
        <br />
        <Settings></Settings>
        {/* <TeamLookUp teamData={teamData}></TeamLookUp> */}
      </FloatChild>
      <FloatChild style={{width: `${100 - offset}%`}}>
        {settings.showForm && <InputForm teamData={teamData}></InputForm>}
      </FloatChild>
    </FloatContainer>
    <Toaster></Toaster>
  </settingsContext.Provider>
}

export default IndexPage

export const Head = () => <title>Score Board</title>