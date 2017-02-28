/*	NOTES
	@ Disabled days time element for the most part of the program since there's probably no one in their right mind who would do a pomodoro session
	with the length of days! lol

*/

/*	@ SETTINGS || Global variables
	@ Default value for Work: 25:00
	@ Default value for Short Break: 5:00
	@ Default value for Long Break: 25:00
	@ status is used to keep track if session is work, shortBreak or longBreak
	@ isPaused keeps track if timer is paused or not (if paused : will use remainingTime as param in startClock() instead of default)
	@ Remaining Time is a placeholder object for time left when pausing/resuming
	@ timeInterval is the variable which contain the setInterval function; So you can clear it when pausing even on another function
	@ autoStartBreaks automatically starts breaks after each pomodoro session
	@ autoStartPomodoros automatically starts the next pomodoro session after every break
	@ pomodoroCounter tracks the number of pomodoros you are doing as displayed in the upper right of the timer. Also used to identify when to take
	long breaks
	@ activeTimer is boolean which prevents multiple instances of timer from running at the same time
*/
var workLength = {
	"hours": 0,
	"minutes": 0,
	"seconds": 10
}

var shortBreakLength = {
	"hours": 0,
	"minutes": 0,
	"seconds": 10
}

var longBreakLength = {
	"hours": 0,
	"minutes": 0,
	"seconds": 10
}

var status = 'work';
var isPaused = false;
var remainingTime;
var timeInterval;
var autoStartBreaks = true;
var autoStartPomodoros = true;
var pomodoroCounter = 1;
var activeTimer = false;



/*
Calculate remaining time
get current time (date)
compute timer length in milliseconds (currentTimer)
break down currentTimer into seconds, minute, hours

*/

/*	@ Calculate expected end of session
	@ Remaining time is computed by subtracting expected end time with the current time (in ms)
	@ Returns object with broken down time remaining
	@ 
*/
var getTimeRemaining = function(endTime){
	var currentTime = Date.parse(new Date());
	var total = endTime - currentTime; 
	//currentTimer = (1000*60) * time;
	var seconds = Math.floor((total / 1000) % 60);
	var minutes = Math.floor(((total / 1000) / 60) % 60);
	var hours = Math.floor(((total / (1000 * 60 * 60)) % 24));
	var days = Math.floor((total / (1000 * 60 * 60 * 24)));  
	return {
		'total': total,
		'days': days,
		'hours': hours,
		'minutes': minutes,
		'seconds': seconds
	};
}

/*	@ Start Clock
	@ Duration parameter is an object which contains the duration of the session
	@ End Time variable is computed by adding the duration to the current time (in ms)
	@ Sets a time interval to call getTimeRemaining every second and update clock
	@ NEVERMIND Sets global variable remainingTime = time.total every second
*/
var startClock = function(duration){
	activeTimer = true;
	isPaused=false;

	var durationMS = (duration.hours / 60) * 1000;
	durationMS += (1000*60) * duration.minutes;
	durationMS += (1000 * duration.seconds);

	var currentTime = Date.parse(new Date());
	var endTime = currentTime + durationMS;
	var clock = document.getElementById('time');
				
	timeInterval = setInterval(function(){
		var time = getTimeRemaining(endTime);
		if (time.minutes < 10){
			time.minutes = "0"+time.minutes;
		}
		if (time.seconds < 10){
			time.seconds = "0"+time.seconds;
		}
		
		//remainingTime = time.total;
		clock.innerHTML = time.minutes + ":" + time.seconds;

		if (time.total <= -1){
			clearInterval(timeInterval);
			if (status === 'work'){
				nextSession('break');
			} else{
				nextSession('work');
			};
		}
	}, 1000);
}
/*	@ Handles transitioning from one session to another | Parameter is the type of session to be started
	@ Shows an alert box
	@ clears object remainingTime
	@ changes background color of well depending if break or work
	@ Sets clock and status
	@ Checks if break is supposed to be a long or short one
	@ Automatically starts the next session if autoStart Setting is set to true
*/
var nextSession = function(sessionType){
	activeTimer = false;
	remainingTime ={};
	if (sessionType === "break"){
		alert('Pomodoro is finished! Have a break');
		$('.stop-label').html('SKIP');
		$('#stop').children('.fa').removeClass('fa-stop').addClass('fa-step-forward');
		$('.pomodoro-well').css('background-color', 'rgba(9,102,104,.9)');
		if (pomodoroCounter % 4 === 0){
			//start long break
			status = "longBreak";
			$('#current-pomodoro').html('Take a long break');
			setClock(longBreakLength);
			if (autoStartBreaks === true){
				startClock(longBreakLength);
			}
		} else{
			//start short break
			status = "shortBreak";
			$('#current-pomodoro').html('Take a short break');
			setClock(shortBreakLength);
			if (autoStartBreaks === true){
				startClock(shortBreakLength);
			}
		}
	} else if (sessionType === "work"){
		alert('Break is over. The next pomodoro will go better. Good Luck!');
		$('.stop-label').html('STOP');
		$('#stop').children('.fa').removeClass('fa-step-forward').addClass('fa-stop');
		pomodoroCounter++;
		$('#current-pomodoro').html('POMODORO #'+pomodoroCounter);
		$('.pomodoro-well').css('background-color', 'rgba(255,30,0,.7)');
		status = "work";
		setClock(workLength);
		if (autoStartPomodoros === true){
			startClock(workLength);
		}
	}
}


/*	@ Pause Clock Function
	@ timeInterval is the variable name of the setInterval function
	@ time is the placeholder variable of the remaining time as stated in the timer
	@ time is then converted to an array format omitting the :
	@ Use switch statement to assign array values to variables depending on length of array (possible to not have minutes or hours in timer)
	@ Assign values to global variable object remaining time to be accessed when resuming
*/
var pauseClock = function(){
	isPaused = true;
	clearInterval(timeInterval);
	var clock = document.getElementById('time');
	var time = clock.innerHTML;
	time = time.split(':');
	var seconds = 0;
	var minutes = 0;
	var hours = 0;
	//var days = 0;
	
	switch (time.length){
		case 1:
			seconds = time[0];
			break;
		case 2:
			minutes = time[0];
			seconds = time[1];
			break;
		case 3:
			hours = time[0];
			minutes = time[1];
			seconds = time[2];
			break;
	}
	remainingTime = {
		"hours": hours,
		"minutes": minutes,
		"seconds": seconds
	}
}

/*

*/
var stopClock = function(){
	clearInterval(timeInterval);
	activeTimer = false;
	if (status === 'work'){
		alert('Stopped pomodoro session');
		setClock(workLength);
	} else if (status === 'shortBreak'){
		nextSession('work');
	} else if (status === 'longBreak'){
		nextSession('work');
	}

}

/*	@ Function for setting the time in the clock
	@ Takes an object time as parameter
	@ By default displays minutes and seconds, but if hours is > 0, then display that too
*/
var setClock = function(time){
	var clock = document.getElementById('time');
	var minutes = time.minutes;
	var hours = time.hours;
	var seconds = time.seconds;

	if (time.minutes <10){
		minutes = "0"+minutes;
		//time.minutes = "0"+time.minutes;
	}
	if (time.seconds <10){
		seconds = "0"+seconds;
		//time.seconds = "0"+time.seconds;
	}

	if (time.hours > 0){
		if (time.hours < 10){
			hours = "0"+hours;
			//time.hours = "0"+time.hours;
		}
		clock.innerHTML = hours+":"+minutes+":"+seconds;
	} else{
		console.log(minutes +":" + seconds);

		clock.innerHTML = minutes+":"+seconds;
	}
}




$(document).ready(function(){



	/*	@ Event Listerner for navbar active */
	$('.menu').on('click', 'a', function(){
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	});

	//	@ Set default work length, pomodoro counter
	setClock(workLength);
	$('#current-pomodoro').html('POMODORO #'+pomodoroCounter);

	/*	@ Event handler for start
		@ If paused is false; pass either workLength or BreakLength as parameters depending on status
		@ If paused is true; pass global variable remainingTime
		@ Uses boolean activeTimer to check if an instance of the timer is already ticking and prevents more than 1 instance
	*/
	$('#start').on('click', function(){
		if (isPaused === true){
			startClock(remainingTime);
		} else if (activeTimer === false){
			if (status === 'work'){
				startClock(workLength);
			} else if (status ==='shortBreak'){
				startClock(shortBreakLength);
			} else if (status ==='longBreak'){
				startClock(longBreakLength);
			}
		}
	});

	/*	@ Event Handler for pause 	*/
	$('#pause').on('click', function(){
		if (isPaused === false){
			pauseClock();
		}		
	});


	/*	@ Event handler for stop / skip		*/
	$('#stop').on('click', function(){
		if (activeTimer === true){
			stopClock();
		}
	});

});