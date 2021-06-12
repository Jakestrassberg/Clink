const convertPrettyStringToMinutes = (timeInString) => {
	timeInString = timeInString.toLowerCase()
	timeInStringSplit = timeInString.split(" ")
	var time = 0
	var timeInMinutes = 0

	// Basically just a typo check
	if (!timeInStringSplit.includes('hour') && !timeInStringSplit.includes('hours') && !timeInStringSplit.includes('minute') && !timeInStringSplit.includes('minutes')) {
		if (timeInMinutes == '') { //If we're adding a commission or reimbursement or something else that isn't time based
			return 0
		}
		return 'error'
	}
	
	if (timeInStringSplit.includes('hour')) {
		time = parseInt(timeInStringSplit[timeInStringSplit.indexOf('hour') - 1])
		if (Number.isInteger(time)) {
			timeInMinutes += time * 60
		} else {
			return 'error'
		}
	} else if (timeInStringSplit.includes('hours')) {
		time = parseInt(timeInStringSplit[timeInStringSplit.indexOf('hours') - 1])
		if (Number.isInteger(time)) {
			timeInMinutes += time * 60
		} else {
			return 'error'
		}
	}

	if (timeInStringSplit.includes('minute')) {
		time = parseInt(timeInStringSplit[timeInStringSplit.indexOf('minute') - 1])
		if (Number.isInteger(time)) {
			timeInMinutes += time
		} else {
			return 'error'
		}

	} else if (timeInStringSplit.includes('minutes')) {
		time = parseInt(timeInStringSplit[timeInStringSplit.indexOf('minutes') - 1])
		if (Number.isInteger(time)) {
			timeInMinutes += time
		} else {
			return 'error'
		}
	}

	return timeInMinutes
}

const convertMinutesToPrettyString = (timeInMinutes) => {
	if (typeof (timeInMinutes) != 'number') {
		return 'error'
	}
	var taskHours = Math.floor(timeInMinutes / 60)
	var taskMinutes = timeInMinutes % 60
	if (taskHours != 0) { // There are hours
		if (taskHours > 1) {
			timeInPrettyStringFormat = taskHours + ' Hours'
		} else {
			timeInPrettyStringFormat = '1 Hour'
		}
		if (taskMinutes != 0) {
			if (taskMinutes > 1) {
				timeInPrettyStringFormat += ' and ' + taskMinutes + ' Minutes'
			} else {
				timeInPrettyStringFormat += ' and 1 Minute'
			}
		}
	} else if (taskMinutes != 0) { // No hours
		if (taskMinutes != 0) {
			if (taskMinutes > 1) {
				timeInPrettyStringFormat = taskMinutes + ' Minutes'
			} else {
				timeInPrettyStringFormat = '1 Minute'
			}
		}
	} else { // Not a task
		timeInPrettyStringFormat = ''
	}
	return timeInPrettyStringFormat
}

const convertTimePeriodToMinutes = (start, end) => {
	console.log(start,end)
	if (start.includes(':')) { // To stop stuff like 10:1
		if (start.split(':')[1].length != 2) {
			return 'error'
		}
	} else {
		if (start.length == 3 || start.length > 4) { // To stop stuff like 101
			return 'error'
		}
	}
	
	if (end.includes(':')) {
		if (end.split(':')[1].length != 2) {
			return 'error'
		}
	} else {
		if (end.length == 3 || end.length > 4) { // To stop stuff like 101
			return 'error'
		}
	}

	start = start.replace(':', '')
	end = end.replace(':', '')
	// Remove leading 0's ex: 0105
	if (start[0] == '0') {
		start = start.substring(1)
	}
	if (end[0] == '0') {
		end = end.substring(1)
	}

	if (!/^\d+$/.test(start) || !/^\d+$/.test(start)) { // Numbers only
		return 'error'
	}

	try {
		// Can't do anything if there are too many characters
		if (start.length < 5 && end.length < 5) {
			// Parse out the hours and minutes
			if (start.length <= 2) { // ex: 1 or 12
				var startH = parseInt(start)
				var startM = 00
			} else if (start.length == 3) { // ex: 120
				var startH = parseInt(start.slice(0, 1))
				var startM = parseInt(start.slice(1, 3))
			} else { // ex: 1200
				var startH = parseInt(start.slice(0, 2))
				var startM = parseInt(start.slice(2, 4))
			}

			if (end.length <= 2) {
				var endH = parseInt(end)
				var endM = 00
			} else if (end.length == 3) {
				var endH = parseInt(end.slice(0, 1))
				var endM = parseInt(end.slice(1, 3))
			} else {
				var endH = parseInt(end.slice(0, 2))
				var endM = parseInt(end.slice(2, 4))
			}

			console.log(startH, startM, endH, endM)

			if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) { // Just for safety
				return 'error'
			}

			// Convert hours to minutes
			if (endH > startH) { // ex: 2 > 1
				var differenceHours = endH - startH
			} else if (startH > endH) {
				var differenceHours = (12 - startH) + endH
			} else {
				var differenceHours = 0
			}
			var totalMinutes = differenceHours * 60

			// Determine if were adding or subtracing the minutes
			if (startM > endM) { // ex: 05 10
				var differenceMinutes = endM - startM
				totalMinutes = totalMinutes + differenceMinutes
			} else { // ex: 10 05
				var differenceMinutes = startM - endM
				totalMinutes = totalMinutes - differenceMinutes
			}

			return totalMinutes

		} else {
			return 'error'
		}
	} catch {
		return 'error'
	}
}

module.exports = {
	convertPrettyStringToMinutes,
	convertMinutesToPrettyString,
	convertTimePeriodToMinutes
}