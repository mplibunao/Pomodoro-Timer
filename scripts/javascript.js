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
	@ longBreakDelay tells the program how many pomodoros between long breaks. Default is 4 poms then long break
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
var longBreakDelay = 4;


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

	/* Anonymous function passed to setinterval */
	var updateClock = function(){
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
}

	activeTimer = true;
	isPaused=false;

	var durationMS = (duration.hours / 60) * 1000;
	durationMS += (1000*60) * duration.minutes;
	durationMS += (1000 * duration.seconds);

	var currentTime = Date.parse(new Date());
	var endTime = currentTime + durationMS;
	var clock = document.getElementById('time');
	updateClock();
	timeInterval = setInterval(updateClock,1000)
	/*			
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
	*/
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
		if (pomodoroCounter % longBreakDelay === 0){
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
	clock.innerHTML = addLeadingZeros(time);
}

/*	@ Convert int to string and add leading 0 if less than 10
	@ Does not include hour in returned format if hour is 0
*/
var addLeadingZeros = function(time){
	var minutes = time.minutes;
	var hours = time.hours;
	var seconds = time.seconds;

	if (time.minutes <10 && time.minutes.length != 2){
		minutes = "0"+minutes;
	}
	if (time.seconds <10 && time.seconds.length != 2){
		seconds = "0"+seconds;
		//time.seconds = "0"+time.seconds;
	}
	if (time.hours > 0){
		if (time.hours < 10){
			hours = "0"+hours;
		}
		return hours +":"+minutes+":"+seconds;
	} else{
		// if hidden arguments were passed, return hour anyway
		if (arguments[1]){
			return "00:"+minutes+":"+seconds;
		}
		return minutes+":"+seconds;
	}
}

/*	@ Displays setting variables in modal
	@ If timer is running / activeTimer = true; disable all textbox
*/
var getCurrentSettings = function(){
	clearModalError();
	var longBreakTemp = addLeadingZeros(longBreakLength, 'addHourAnyway');
	var shortBreakTemp = addLeadingZeros(shortBreakLength, 'addHourAnyway');
	var workTemp = addLeadingZeros(workLength, 'addHourAnyway');

	$('#pomodoro-duration').val(workTemp);
	$('#short-break-duration').val(shortBreakTemp);
	$('#long-break-duration').val(longBreakTemp);
	$('#long-break-delay').val(longBreakDelay);
	$('#auto-start-pomodoros').prop('checked', autoStartPomodoros);
	$('#auto-start-breaks').prop('checked', autoStartBreaks);

	if (activeTimer === true){
		$('.fieldset').prop('disabled', true);
	} else {
		$('.fieldset').prop('disabled', false);
	}
}

//	@ Check if value follows the hh:mm:ss int format
var validateSettingsValue = function(settings){
	return settings.map(function(current){
		return /^\d{2}:\d{2}:\d{2}$|^\d{2}:\d{2}$/.test(current);
	});
}

/*	@ Called by getCurrentSettings when opening the modal
	@ Resets or clears any error messages and styling in the modal
*/
var clearModalError = function(){
	$('#pomodoro-duration').closest('.form-group').removeClass('has-error has-feedback');
	$('#pomodoro-duration').closest('.controls').find('.glyphicon').remove();
	$('#pomodoro-duration').next('.help-block').html('hh:mm:ss');
	$('#short-break-duration').closest('.form-group').removeClass('has-error has-feedback');
	$('#short-break-duration').closest('.controls').find('.glyphicon').remove();
	$('#short-break-duration').next('.help-block').html('hh:mm:ss');
	$('#long-break-duration').closest('.form-group').removeClass('has-error has-feedback');
	$('#long-break-duration').closest('.controls').find('.glyphicon').remove();
	$('#long-break-duration').next('.help-block').html('hh:mm:ss');
	$('#long-break-delay').closest('.form-group').removeClass('has-error has-feedback');
	$('#long-break-delay').closest('.controls').find('.glyphicon').remove();
	$('#long-break-delay').next('.help-block').html('Pomodoros before long break');
}



$(document).ready(function(){

	/*	@ Event Listener for save settings button in modal
		@ Check validity of time formats and int and store results in an array
		@ Check if all values are valid using array every, if not identify which failed the test
	*/
	$('.modal-save').on('click', function(){
		var pomodoroDuration = $('#pomodoro-duration').val();
		var shortBreakDuration = $('#short-break-duration').val();
		var longBreakDuration = $('#long-break-duration').val();
		var longBreak = $('#long-break-delay').val();

		var settingsValue = [pomodoroDuration, shortBreakDuration, longBreakDuration];
		var isValid = validateSettingsValue(settingsValue);
		console.log(isValid);
		if (isNaN(longBreak) === false && longBreak > 0){
			isValid.push(true);
		} else{
			isValid.push(false);
		}

		var allValid = isValid.every(function(current){
			return current === true;
		});
		
		if (allValid === true){
			console.log('saving settings');

			pomodoroDuration = pomodoroDuration.split(':');
			console.log(pomodoroDuration);
			shortBreakDuration = shortBreakDuration.split(':');
			longBreakDuration = longBreakDuration.split(':');

			//change values of global variables
			longBreakDelay = longBreak;
			workLength.hours = pomodoroDuration[0];
			workLength.minutes = pomodoroDuration[1];
			workLength.seconds = pomodoroDuration[2];
			shortBreakLength.hours = shortBreakDuration[0];
			shortBreakLength.minutes = shortBreakDuration[1];
			shortBreakLength.seconds = shortBreakDuration[2];
			longBreakLength.hours = longBreakDuration[0];
			longBreakLength.minutes = longBreakDuration[1];
			longBreakLength.seconds = longBreakDuration[2];
			autoStartPomodoros = $('#auto-start-pomodoros').prop("checked");
			autoStartBreaks = $('#auto-start-breaks').prop("checked");
			//close the modal using jquery
			$('#settings').modal('hide');
		} else{
			for (var i=0; i<isValid.length; i++){
				if (isValid[i] === false){
					//switch i to the different text boxes
					switch (i){
						case 0:
							$('#pomodoro-duration').closest('.form-group').addClass('has-error has-feedback');
							$('#pomodoro-duration').closest('.controls').append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
							$('#pomodoro-duration').next('.help-block').html('Please use the following format hh:mm:ss');
							break;
						case 1:
							$('#short-break-duration').closest('.form-group').addClass('has-error has-feedback');
							$('#short-break-duration').closest('.controls').append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
							$('#short-break-duration').next('.help-block').html('Please use the following format hh:mm:ss');
							break;
						case 2:
							$('#long-break-duration').closest('.form-group').addClass('has-error has-feedback');
							$('#long-break-duration').closest('.controls').append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
							$('#long-break-duration').next('.help-block').html('Please use the following format hh:mm:ss');
							break;
						case 3:
							$('#long-break-delay').closest('.form-group').addClass('has-error has-feedback');
							$('#long-break-delay').closest('.controls').append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
							$('#long-break-delay').next('.help-block').html('Please use an integer to set the pomodoros before long break');
							break;
					}
				} else{
					switch (i){
						case 0:
							$('#pomodoro-duration').closest('.form-group').removeClass('has-error has-feedback');
							$('#pomodoro-duration').closest('.controls').find('.glyphicon').remove();
							$('#pomodoro-duration').next('.help-block').html('hh:mm:ss');
							break;
						case 1:
							$('#short-break-duration').closest('.form-group').removeClass('has-error has-feedback');
							$('#short-break-duration').closest('.controls').find('.glyphicon').remove();
							$('#short-break-duration').next('.help-block').html('hh:mm:ss');
							break;
						case 2:
							$('#long-break-duration').closest('.form-group').removeClass('has-error has-feedback');
							$('#long-break-duration').closest('.controls').find('.glyphicon').remove();
							$('#long-break-duration').next('.help-block').html('hh:mm:ss');
							break;
						case 3:
							$('#long-break-delay').closest('.form-group').removeClass('has-error has-feedback');
							$('#long-break-delay').closest('.controls').find('.glyphicon').remove();
							$('#long-break-delay').next('.help-block').html('Pomodoros before long break');
							break;
					}
				}
			}
		}
	});

	//	@ Event Listener for settings button
	$('.settings-modal').on('click', getCurrentSettings);

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