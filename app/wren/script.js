function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Calculate the rotation for each hand
    // Seconds: 360 degrees / 60 seconds = 6 degrees per second
    const secondDegrees = seconds * 6;
    // Minutes: 360 degrees / 60 minutes = 6 degrees per minute
    const minuteDegrees = minutes * 6 + (seconds / 10); // Add a little offset based on seconds
    // Hours: 360 degrees / 12 hours = 30 degrees per hour. Also account for minutes.
    const hourDegrees = hours * 30 + (minutes / 2); // Add a little offset based on minutes

    // Update the hands' rotation
    document.getElementById('second-hand').style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to set the clock hands at the start
updateClock();
