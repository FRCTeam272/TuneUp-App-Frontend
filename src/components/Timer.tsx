import React from "react"
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useSettings } from "../contexts/settingsContext";
import useSound from "use-sound";
import dingSound from '../../static/timerding.mp3'
import "../mobile.css"
export function minutesToSeconds(time: string): number {
    if(time.includes(":")){
      const [min, second] = time.split(":");
      return Number(min) * 60 + Number(second)
    }

    return Number(time)
}

function secondsToMins(time: number): string {
    let min = Math.floor(time / 60)
    let second = time % 60;
    if(second > 9){
        return `${min}:${second}`
    }
    else {
        return `${min}:0${second}`
    }

}

export default function Timer(){
    const [settings] = useSettings();
    const [ding] = useSound(dingSound)
    const [humanReadableTime, setHumanReadableTime] = useState(settings.timer);
    const [time, setTime] = useState(new Date().toLocaleTimeString())

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

    // New settings reset and stop the timer.
    useEffect(() => {
        setCount(minutesToSeconds(settings.timer))
        setTicking(false)
    }, [settings])

    return <>
        {settings.showTime && <Button className="projector-time">
            {time}
        </Button>}
        {!settings.showTime && <Button onClick={() => setTicking(!ticking)} className="projector-timer">
            {humanReadableTime}
        </Button>}
    </>
}
