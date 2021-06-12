const moment = require('moment');
const themes = require('./themes')
const settingsService = require('./settingsService.js')
var colorTheme = themes['defaultColors']
if (themes[settingsService.getSettings().theme]) {
	var colorTheme = themes[settingsService.getSettings().theme]
}
const timeParsingService = require('./timeParsingService.js')
const figlet = require('figlet');

function displayTaskData(data, taskInProgress) {

    taskInProgress = taskInProgress || null

	if (data.length == 0) {
		console.log(figlet.textSync('                         No Tasks'));
		console.log('                            [Type "new task" to create a task]')
		console.log(' ')
	}
	try {
		// I probably could have done all this date stuff in a simpler way but the way I did it should work for any format
		var maxDateCharacters = 0
		for (i = 0; i < data.length; i++) {
			var dateInPrettyFormat = new Date(Math.round((data[i]['Date Started'] - 25567) * 86400 * 1000)) // Not totally sure how this works
			var dateInPrettyFormat = moment(dateInPrettyFormat).format('M/D/YY')
			if (dateInPrettyFormat.length > maxDateCharacters) {
				maxDateCharacters = dateInPrettyFormat.length
			}
		}

		maxDateCharacters = maxDateCharacters += 1 // For the space at the end
		var maxDateCharactersAsSpaces = ''
		for (i = 1; i < maxDateCharacters; i++) { // Can't think of a better way to do this
			maxDateCharactersAsSpaces = maxDateCharactersAsSpaces += ' '
		}
		// Calculating the spaces for Task_Description now
		var maxTaskCharacters = 0
		for (i = 0; i < data.length; i++) {
			if (data[i].Task.length > maxTaskCharacters) {
				maxTaskCharacters = data[i].Task.length
			}
		}

		maxTaskCharacters += 1
		var maxTaskCharactersAsSpaces = ''
		for (i = 1; i < maxTaskCharacters; i++) { // Can't think of a better way to do this
			maxTaskCharactersAsSpaces += ' '
		}
		for (let i = 0; i < data.length; i++) {
			if (data.length > 9) { // So some will be double digit
				var taskNumberspaces = ' '.slice((i + 1).toString().length - 1, 2)
			} else {
				taskNumberspaces = ' '
			}

			// 25568 in Excel date format is Jan 1st 1970. JS counts the number of Ms since this date. 86400 * 1000 converts it to Ms.
			var dateInPrettyFormat = new Date(Math.round((data[i]['Date Started'] - 25568) * 86400 * 1000))
			var dateInPrettyFormat = moment(dateInPrettyFormat).format('M/D/YY')

			var taskSpaces = maxTaskCharactersAsSpaces.slice(data[i].Task.length - 1, maxTaskCharactersAsSpaces.length - 1)
			var dateSpaces = maxDateCharactersAsSpaces.slice(dateInPrettyFormat.length - 1, maxDateCharactersAsSpaces.length - 1)

			if (timeParsingService.convertMinutesToPrettyString(data[i].Hours).length != 0) {
				var hoursSpaces = '                       '.slice(timeParsingService.convertMinutesToPrettyString(data[i].Hours).length - 1, 22)
			} else { // Not a task
				var hoursSpaces = '                       '
			}

			var lineLength = 0
			lineLength = `${i + 1 + taskNumberspaces} | ${dateInPrettyFormat + dateSpaces} | ${data[i].Task + taskSpaces} | ${timeParsingService.convertMinutesToPrettyString(data[i].Hours) + hoursSpaces} | ${'$' + data[i].Amount.toFixed(2)}`.length
			var maxLineLength = 0
			var dividerLine = '-'
			if (lineLength > maxLineLength) {
				maxLineLength = lineLength
			}
			for (let i = 0; i < maxLineLength; i++) {
				dividerLine += '-'
			}

            if (taskInProgress == i) {
                console.log(`${colorTheme.taskNumber(i + 1 + taskNumberspaces)} | ${colorTheme.taskDate(dateInPrettyFormat + dateSpaces)} | ${colorTheme.taskDescription(data[i].Task) + taskSpaces} | ${colorTheme.taskTime(timeParsingService.convertMinutesToPrettyString(data[i].Hours)) + hoursSpaces} | ${colorTheme.taskAmount('$' + data[i].Amount.toFixed(2))}   (in progress)`)
            } else {
				console.log(`${colorTheme.taskNumber(i + 1 + taskNumberspaces)} | ${colorTheme.taskDate(dateInPrettyFormat + dateSpaces)} | ${colorTheme.taskDescription(data[i].Task) + taskSpaces} | ${colorTheme.taskTime(timeParsingService.convertMinutesToPrettyString(data[i].Hours)) + hoursSpaces} | ${colorTheme.taskAmount('$' + data[i].Amount.toFixed(2))}`)
				// if (timeParsingService.convertMinutesToPrettyString(data[i].Hours) == '0 Minutes' && data[i].Amount != 0) {
				// 	// Must be a line/item and not an actual task
				// 	hoursSpaces = '                       '
				// 	console.log(`${colorTheme.taskNumber(i + 1 + taskNumberspaces)} | ${colorTheme.taskDate(dateInPrettyFormat + dateSpaces)} | ${colorTheme.taskDescription(data[i].Task) + taskSpaces} | ${hoursSpaces} | ${colorTheme.taskAmount('$' + data[i].Amount.toFixed(2))}`)
				// } else {
				// 	console.log(`${colorTheme.taskNumber(i + 1 + taskNumberspaces)} | ${colorTheme.taskDate(dateInPrettyFormat + dateSpaces)} | ${colorTheme.taskDescription(data[i].Task) + taskSpaces} | ${colorTheme.taskTime(timeParsingService.convertMinutesToPrettyString(data[i].Hours)) + hoursSpaces} | ${colorTheme.taskAmount('$' + data[i].Amount.toFixed(2))}`)
				// }
            }
		}
	} catch (err) {
        console.log(err)
		console.log('Cannot read Excel file.')
	}
	if (dividerLine) {
		console.log(dividerLine)
	} else {
		console.log('--------------------------------------------------------------------------------------')
	}
}

module.exports = displayTaskData