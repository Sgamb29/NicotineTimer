
const mainOutput = document.getElementById("mainOutput");
const statsOutput = document.getElementById("statsOutput");

// Cookie Keys
const timesBetweenKey = "timesBetween";
const lastNicKey = "lastNicTime";
const sessionCountKey = "sessions";

class Timer {
    lastNicotineTime = null;
    intervalId = null;
    seconds = 0;
    timesBetween = [];
    sessions = 0;

    // Stopwatch outputs the time str duration from last nic time.
    runStopwatch() {
        mainOutput.innerText = this.getTimeStr(this.seconds);
        this.intervalId = setInterval(() => {
            this.seconds = this.getDurationSecondsFromDate(this.lastNicotineTime);
            mainOutput.innerText = this.getTimeStr(this.seconds);
        }, 1000);
    }

    stopStopwatch() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    buttonPressStartLogic() {
        // If != null pushing the duration from last session to times between list.
        if (this.lastNicotineTime != null) {
            this.timesBetween.push(this.getDurationSecondsFromDate(this.lastNicotineTime));
            setCookie(timesBetweenKey, this.timesBetween.join("-"), 1000);
        } 

        this.lastNicotineTime = new Date();
        setCookie(lastNicKey, this.lastNicotineTime.toString(), 10000);
        this.sessions += 1;
        setCookie(sessionCountKey, this.sessions.toString(), 10000);

        this.displayTodaysStats();
        if (this.intervalId === null) {
            this.runStopwatch();
        }
        mainOutput.innerText = "00:00:00";
    }

    getAverageSecondsBetween() {
        let sum = 0;
        this.timesBetween.forEach((num) => {
            sum += parseInt(num);
        })
        return parseInt(sum / this.timesBetween.length);
    }

    getDurationSecondsFromDate(dt) {
        const now = new Date();
        return (now.getTime() - dt.getTime()) / 1000;
    }

    setVariablesFromLoad(lastNic, times, seshs) {
        this.lastNicotineTime = new Date(lastNic);
        this.seconds = this.getDurationSecondsFromDate(this.lastNicotineTime);
        if (times !== "") {
            this.timesBetween = times.split("-");
        }
        if (seshs !== "") {
            this.sessions = parseInt(seshs);
        }
        this.displayTodaysStats();
    }

    displayTodaysStats() {
        statsOutput.innerText = `Average Time: ${this.getTimeStr(this.getAverageSecondsBetween())}
        \nSessions: ${this.sessions}`;
    }

    newTrackingDay() {
        this.lastNicotineTime = null;
        this.timesBetween = [];
        this.stopStopwatch();
        setCookie(timesBetweenKey, "", 10000);
        setCookie(lastNicKey, "", 10000);
        this.seconds = 0;
        this.sessions = 0;
        mainOutput.innerText = this.getTimeStr(this.seconds);
        this.displayTodaysStats();
    }

    getTimeStr(seconds) {
        if (!seconds) {
            return "00:00:00";
        }
        seconds = parseInt(seconds);
        let minutes = parseInt(seconds / 60);
        let hours = parseInt(minutes / 60);

        if (seconds >= 60) seconds = seconds - minutes * 60;
        if (minutes >= 60) minutes = minutes - hours * 60;

        const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const hrStr = hours < 10 ? `0${hours}` : `${hours}`; 
        return `${hrStr}:${minStr}:${secStr}`;
    }
}

const timer = new Timer();

function startNicotineTime() {
    timer.buttonPressStartLogic();
}

function newTrackingDay() {
    timer.newTrackingDay();
}

document.addEventListener("DOMContentLoaded", () => {
    const lastSesh = getCookie(lastNicKey);
    const timesBetween = getCookie(timesBetweenKey);
    const seshs = getCookie(sessionCountKey);

    if (lastSesh !== "") {
        timer.setVariablesFromLoad(lastSesh, timesBetween, seshs);
        timer.runStopwatch();
    } else {
        timer.newTrackingDay();
    }
    if (timesBetween !== "") {
        timer.displayTodaysStats();
    }
});


function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    try {
        const value = document.cookie.split(`${name}=`)[1].split(";")[0];
        return value;
        } catch {
            return "";
        }
}