
const mainOutput = document.getElementById("mainOutput");
const goalOutput = document.getElementById("goalOutput");
const timesList = document.getElementById("nicTimesList");
const statsOutput = document.getElementById("statsOutput");
let currentGoal = 0;
let sessionCount = 0;
let reachedGoalCount = 0;
let startTime = 0;
let quitReasons = "";


let lastNicotineTime = 0;
let timerInterval = 0;
let timePassed = 0;
const nextNicTime = document.getElementById("nextNicTime");

function startNicotineTime(cookieSet=false) {
    const prefix = "Time Since Nicotine: ";
    // !cookieSet is same as waiting for button press
    if (!cookieSet) {
        lastNicotineTime = new Date();
        setCookie("lastNicTime", lastNicotineTime.toString(), 10000);
        sessionCount += 1;
        setCookie("sessionCount", sessionCount.toString(), 10000);
        if (timePassed >= currentGoal * 60 * 1000) {
            reachedGoalCount += 1;
            setCookie("goalCount", reachedGoalCount.toString(), 10000);
        }
    }
    let nextNicHoursAndMins = new Date();
    nextNicHoursAndMins.setTime(lastNicotineTime.getTime() + currentGoal * 60 * 1000);
    let nextHr = nextNicHoursAndMins.getHours();
    let nextMins = nextNicHoursAndMins.getMinutes();
    nextHr = nextHr < 10 ? `0${nextHr}` : `${nextHr}`;
    nextMins = nextMins < 10 ? `0${nextMins}` : `${nextMins}`;
    nextNicTime.innerText = `Next nicotine goal time: ${nextHr}:${nextMins}`;
    const n2 = new Date();
    if (n2.getTime() - nextNicHoursAndMins.getTime() >= currentGoal * 60 * 1000) {
        nextNicTime.style.color = "green";
    } else {
        nextNicTime.style.color = "white";
    }

    mainOutput.innerText = `${prefix}${getTimeStr(0)}`;
    if (cookieSet) {
        const n = new Date();
        mainOutput.innerText = `${prefix}${getTimeStr(n.getTime() - lastNicotineTime.getTime())}`;
    }
    
    updateStatsOuput();

    timerInterval = setInterval(() => {
        const now = new Date();
        timePassed = now.getTime() - lastNicotineTime.getTime();

        mainOutput.innerText = `${prefix}${getTimeStr(timePassed)}`;
    }, 1000);

}

function getTimeStr(mili) {
    let seconds = parseInt(mili / 1000);
    let minutes = parseInt(seconds / 60);
    let hours = parseInt(minutes / 60);

    if (seconds >= 60) seconds = seconds - minutes * 60;
    if (minutes >= 60) minutes = minutes - hours * 60;

    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const hrStr = hours < 10 ? `0${hours}` : `${hours}`; 

    return `${hrStr}:${minStr}:${secStr}`;
}

function resetStats() {
    sessionCount = 0;
    reachedGoalCount = 0;
    setCookie("sessionCount", sessionCount.toString(), 10000);
    setCookie("goalCount", reachedGoalCount.toString(), 10000);
    updateStatsOuput();
}

function setGoal() {
    const validGoal = new RegExp("^[0-9]+$");
    const input = prompt("Input Goal: ");
    if (validGoal.test(input)) {
        currentGoal = parseInt(input);
        goalOutput.innerText = "Current Goal: " + input + " mins";
        setCookie("goal", currentGoal.toString(), 10000);
    }

}

function updateStatsOuput() {
    let reachedPercent = reachedGoalCount / sessionCount * 100;
    const statsStr = `Sessions: ${sessionCount}\nGoal Reached Count: ${reachedGoalCount}\nPercent: ${reachedPercent.toFixed(0)}%`;
    statsOutput.innerText = statsStr;
    goalOutput.innerText = `Current Goal: ${currentGoal} mins`;
}

document.addEventListener("DOMContentLoaded", () => {

    const lastSesh = getCookie("lastNicTime");
    const g = getCookie("goal");
    const gc = getCookie("goalCount");
    const sc = getCookie("sessionCount");
    const rs = getCookie("reasons");

    currentGoal = g !== "" ? parseInt(g) : 0;
    reachedGoalCount = gc !== "" ? parseInt(gc) : 0;
    sessionCount = sc !== "" ? parseInt(sc) : 0;
    quitReasons = rs !== "" ? rs : "";
    

    if (lastSesh !== "") {
        lastNicotineTime = new Date(lastSesh);
        startNicotineTime(true);
    }
    updateStatsOuput();
    setCookie("reasons", quitReasons, 10000);
    addReason(true);

});

const reasonsInput = document.getElementById("reasonsInput");
const reasonsOutput = document.getElementById("reasonsOutput");
const seperator = "--+--";

function addReason(reload=false) {
    if (!reload) {
        quitReasons = quitReasons + seperator + reasonsInput.value;
        reasonsInput.value = "";
    }
    const reasonsList = quitReasons.split(seperator);
    reasonsOutput.innerText = "";
    let reasonsString = "";
    reasonsList.forEach((r) => {
        if (r === "") {
            return;
        }
        reasonsString = reasonsString + "* " + r + "\n";
    });
    reasonsOutput.innerText = reasonsString;
    setCookie("reasons", quitReasons, 10000);

}

reasonsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addReason();
    }
})

function resetReasons() {
    quitReasons = "";
    reasonsOutput.innerText = "";
    setCookie("reasons", quitReasons, 10000);
}


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


