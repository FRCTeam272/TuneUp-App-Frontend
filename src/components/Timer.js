import React from "react"
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { settingsContext } from "../contexts/settingsContext";
import { useSound } from "use-sound";
import dingSound from '../../static/timerding.mp3'
export function minutesToSeconds(time){
    if(time.includes(":")){
      const [min, second] = time.split(":");
      return Number(min) * 60 + Number(second)
    }
  
    return Number(time)
}
  
function secondsToMins(time){
    let min = Number((time / 60).toString().split(".")[0])
    let second = time % 60;
    if(second > 9){
        return `${min}:${second}`
    }
    else {
        return `${min}:0${second}`
    }
    
}

export default function Timer(){
    const [settings, setSettings] = useContext(settingsContext);
    const [ding] = useSound(dingSound)
    const [humanReadableTime, setHumanReadableTime] = useState(settings.timer);
    const [showRealTime, setShowRealTime] = useState(settings.showTime);
    const [time, setTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
        console.log(settings.showTime)
    }, [settings.showTime])

    const [ticking, setTicking] = useState(false);
    const [count, setCount] = useState(minutesToSeconds(settings.timer));
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if(count > 0){
            const timer = setTimeout(() => ticking && setCount(count-1), 1e3)
            return () => clearTimeout(timer)
        } else {
            setCount(minutesToSeconds(settings.timer))
            setTicking(false)
        }
    }, [count, ticking])

    useEffect(() => {
        setHumanReadableTime(secondsToMins(count))
    }, [count])

    useEffect(() => {
        setCount(minutesToSeconds(settings.timer))
    }, [ticking])

    useEffect(() => {
        setCount(settings.timer)
    }, [settings])

    return <>
        {settings.showTime && <Button style={{backgroundColor:"green", width:"98%", fontSize: "50px", marginTop: "20px", marginLeft: "10px", marginRight: "10px", marginBottom: "10px"}}>
            {time}
        </Button>}
        {!settings.showTime && <Button onClick={() => setTicking(!ticking)} style={{backgroundColor:"green", width:"98%", fontSize: "50px", marginTop: "20px", marginLeft: "10px", marginRight: "10px", marginBottom: "10px"}}>
            {humanReadableTime}
        </Button>}
    </>
}