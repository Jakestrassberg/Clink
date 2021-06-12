const inquirer = require('inquirer');
const settingsService = require('./settingsService.js')
const timeParsingService = require('./timeParsingService.js')
const spreadsheetService = require('./spreadsheetService.js')
const moment = require('moment');
var XLSX = require('xlsx');
var asciichart = require ('asciichart')
const themes = require('./themes')
//const colorTheme = themes[settingsService.getSettings().theme]
var colorTheme = themes['defaultColors']
if (themes[settingsService.getSettings().theme]) {
	var colorTheme = themes[settingsService.getSettings().theme]
}
const displayTaskData = require('./displayTaskData')

var emptyPrompt = [
	{
		type: 'input',
		name: 'emptyPrompt',
		prefix: colorTheme.you('You:'),
		message: ' '
	},
];

const newTaskQuestions = [
	{
		type: 'input',
		name: 'date',
		prefix: colorTheme.clinkName('Clink:'),
		message: "Please enter a date for when the task was started (leave blank for today's date). Format: M/D/YY"
	},
	{
		type: 'input',
		name: 'description',
		prefix: colorTheme.clinkName('Clink:'),
		message: 'Please enter a short description for the task',
		validate: function (value) {
			if (value.length <= 45) {
				return true
			} else {
				return 'Description can only be 45 characters long'
			}
		}
	}
];

var newItemQuestions = [
	{
		type: 'input',
		name: 'date',
		message: "Please enter a date for the new item (leave blank for today's date). Format: M/D/YY"
	},
	{
		type: 'input',
		name: 'description',
		message: 'Please enter a short description for the item',
		validate: function (value) {
			if (value.length <= 30) {
				return true
			} else {
				return 'Description can only be 45 characters long'
			}
		}
	},
	{
		type: 'input',
		name: 'amount',
		message: 'What should I list as the amount for this item?'
	}
];

var renameTaskQuestions = [
	{
		type: 'input',
		name: 'description',
		prefix: colorTheme.clinkName('Clink:'),
		message: 'Please enter a short description for the task',
		validate: function (value) {
			if (value.length <= 45) {
				return true
			} else {
				return 'Description can only be 45 characters long'
			}
		}
	}
]

var updateSettingsQuestions = [
	{
		type: 'input',
		name: 'hourlyPay',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'Please enter your hourly pay rate',
	},
	{
		type: 'input',
		name: 'nextInvoiceDate',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'When do you have to submit your next invoice? Format: M/D/YY'
	},
	{
		type: 'input',
		name: 'invoiceDirectory',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'Where should I save invoices?'
	},
	{
		type: 'input',
		name: 'invoiceNumber',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'What number invoice are you currently on?'
	}
];

// var stopTaskQuestion = [
// 	{
// 		type: 'input',
// 		name: 'stop',
// 		prefix: colorTheme.clinkName('Clink:'),
// 		message: "Press enter to stop the selected task"
// 	},
// ]

var goBackQuestion = [
	{
		type: 'input',
		name: 'back',
		prefix: colorTheme.clinkName('Clink:'),
		message: "Press enter to go to back"
	}
]

const addTimeToTask = (data, selectedTaskIndex, timeToAdd) => {
	if (settingsService.getSettings().roundMinutes) {
		var timeToAddAsString = timeToAdd.toString()
		if (timeToAddAsString[timeToAddAsString.length -1] <= 4) {
			timeToAddAsString = timeToAddAsString.slice(0,-1)
			timeToAddAsString = timeToAddAsString + '0'
			timeToAdd = parseInt(timeToAddAsString)
		} else if (timeToAddAsString[timeToAddAsString.length -1] > 5) {
			timeToAddAsString = timeToAddAsString.slice(0,-1)
			timeToAddAsString = timeToAddAsString + '0'
			timeToAdd = parseInt(timeToAddAsString)
			timeToAdd = timeToAdd + 10
		}
	}

	data[selectedTaskIndex].Hours += timeToAdd
	data[selectedTaskIndex].Amount = Math.round(data[selectedTaskIndex].Hours * settingsService.getSettings().minutelyPay)

	var updatedSettings = settingsService.getSettings()
	if (updatedSettings.lastTenTimesAdded.length >= 10) { // Just in case
		updatedSettings.lastTenTimesAdded.shift()
	}
	updatedSettings.todayInfo.minutesAdded += timeToAdd
	updatedSettings.lastTenTimesAdded.push(timeToAdd)
	let sum = 0;
	for (let i = 0; i < updatedSettings.lastTenTimesAdded.length; i++) {
		sum += updatedSettings.lastTenTimesAdded[i];
	}
	var averageTimeAdded = sum / 10
	if (timeToAdd > averageTimeAdded) {
		var promptMessage = `Added ${timeParsingService.convertMinutesToPrettyString(timeToAdd)} to task ${selectedTaskIndex + 1}. Nice work!`
	} else {
		var promptMessage = `Added ${timeParsingService.convertMinutesToPrettyString(timeToAdd)} to task ${selectedTaskIndex + 1}.`
	}
	// These come last because we don't want to save any changes if something above didn't work
	settingsService.writeSettings(updatedSettings)
	return {promptMessage: promptMessage, data: data}
}

const subtractTimeFromTask = (data, selectedTaskIndex, timeToSubtract) => {
	// dataBeforeLastEdit = JSON.parse(JSON.stringify(data))
	data[selectedTaskIndex].Hours -= timeToSubtract
	data[selectedTaskIndex].Amount = Math.round(data[selectedTaskIndex].Hours * settingsService.getSettings().minutelyPay)

	var promptMessage = `Subtracted ${timeParsingService.convertMinutesToPrettyString(timeToSubtract)} from task ${selectedTaskIndex + 1}.`
	return {promptMessage: promptMessage, data: data}
}

const createNewTask = async (data) => {
	var promptMessage = ''
	await inquirer.prompt(newTaskQuestions).then(answer => {
		if (answer.date != '') {
			answer.date = new Date(moment(answer.date, 'M/D/YY').format('YYYY/MM/DD'))
		} else {
			answer.date = new Date()
		}
		data.push({ 'Date Started': spreadsheetService.convertJSDateToExcelDate(answer.date), Task: answer.description, Hours: 0, Amount: 0 })
		promptMessage = "Done"
		
	})
	return {promptMessage: promptMessage, data: data}
}

const createNewItem = async (data) => {
	var promptMessage = ''
	await inquirer.prompt(newItemQuestions).then(answer => {
		if (answer.date != '') {
			answer.date = new Date(moment(answer.date, 'M/D/YY').format('YYYY/MM/DD'))
		} else {
			answer.date = new Date()
		}
		var amount = parseInt(answer.amount.replace('$', '')) // Rounds it down
		data.push({ ['Date Started']: spreadsheetService.convertJSDateToExcelDate(answer.date), Task: answer.description, Hours: 0, Amount: amount })
	})
	return {promptMessage: promptMessage, data: data}
}

const renameTask = async (data, selectedTaskIndex) => {
	var promptMessage = `Task ${selectedTaskIndex + 1} has been renamed.`
	await inquirer.prompt(renameTaskQuestions).then(answer => {
		data[selectedTaskIndex].Task = answer.description
	})
	return {promptMessage: promptMessage, data: data}
}

const startTask = async (data, selectedTaskIndex) => {
	console.log('\033[2J')
	displayTaskData(data, selectedTaskIndex)
	console.log(colorTheme.clinkName('Clink: '), colorTheme.clinkOutput(`Starting task ${selectedTaskIndex + 1}. Press Enter to stop.`))

	var now = new Date();
	var timeAtStart = now.getTime()
	var response
	await inquirer.prompt(emptyPrompt).then(answer => {
		var now = new Date();
		var timeAtStop = now.getTime()
		var timeToAdd = Math.floor((timeAtStop - timeAtStart) / 60000)
		
		if (timeToAdd != 0) {
			response = addTimeToTask(data, selectedTaskIndex, timeToAdd)
		} else {
			response = {promptMessage: `Added 0 Minutes to task ${selectedTaskIndex + 1}.`, data: data}
		}
	})
	return response
}

const deleteTask = async (data, selectedTaskIndex) => {
	data.splice(selectedTaskIndex,1)
	var promptMessage = `Removed task/line ${selectedTaskIndex + 1}.`
	return {promptMessage: promptMessage, data: data}
}

const updateSettings = async () => {
	console.log('\033[2J')
	console.log('Press the enter key to skip a question.')
	await inquirer.prompt(updateSettingsQuestions).then(answer => {
		var updatedSettings = settingsService.getSettings()
		answer.hourlyPay.replace('$', '')
		if (answer.hourlyPay != '') {
			updatedSettings.minutelyPay = answer.hourlyPay / 60
		}
		if (answer.nextInvoiceDate != '') {
			updatedSettings.nextInvoiceDate = answer.nextInvoiceDate
		}
		if (answer.invoiceNumber != '') {
			updatedSettings.invoiceNumber = parseInt(answer.invoiceNumber)
		}
		settingsService.writeSettings(updatedSettings)
	})
	return
}

const displayStats = async () => {
	console.log('\033[2J')
	var workbook = XLSX.readFile('work_tracking.xlsx', {});
	var sheetNames = workbook.SheetNames
	var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]])
	var invoiceAmounts = []

	for (var i = 0; i < data.length; i++) {
		if (data[i].Total) {
			var value = data[i].Total
			invoiceAmounts.push(value)
		}
	}

	console.log(colorTheme.taskDescription('    Invoice totals over time:'))
	console.log (colorTheme.taskDate(asciichart.plot(invoiceAmounts, {height: 10})))

	var totalPay = 0
	for (var i = 0; i < invoiceAmounts.length; i++) {
		totalPay = totalPay + invoiceAmounts[i]
	}

	console.log(colorTheme.taskDescription(`Average Invoice: $${Math.round(totalPay / invoiceAmounts.length)}`))
	await inquirer.prompt(goBackQuestion).then(answer => {
		return
	})
	return
}

const outputTodayHours = async (data) => {
	var workedToday = timeParsingService.convertMinutesToPrettyString(settingsService.getSettings().todayInfo.minutesAdded)
	if (workedToday == '') {
		var promptMessage = "You haven't worked today."
	} else {
		var promptMessage = `You've worked for ${timeParsingService.convertMinutesToPrettyString(settingsService.getSettings().todayInfo.minutesAdded)} today.`
	}
	return {promptMessage: promptMessage, data}
}

const outputInvoiceHours = async (data) => {
	var totalHoursThisInvoice = 0
	for (i = 0; i < data.length; i++) {
		totalHoursThisInvoice += data[i].Hours
	}
	return {promptMessage: `You've worked ${(totalHoursThisInvoice / 60).toFixed(1)} hours this invoice period.`, data}
}

const outputTodayPay = async (data) => {
	var payToday = 0
	var today = new Date()
	// Need to find and add all 'items' to payToday because they're not accounted for in settingsService.getSettings().todayInfo.minutesAdded
	for (var i = 0; i < data.length; i++) {
		var taskDate = new Date(Math.round((data[i]['Date Started'] - 25568) * 86400 * 1000))
		if (taskDate.toDateString() == today.toDateString()) {
			if (data[i].Hours == 0) { // To verify it is a 'item' not a 'task'
				payToday += data[i].Amount
			}
		}
	}
	payToday += Math.round(settingsService.getSettings().todayInfo.minutesAdded * settingsService.getSettings().minutelyPay)
	return {promptMessage: `You've earned $${payToday}.00 today. Nice!`, data}
}

const outputInvoicePay = async (data) => {
	var totalPayThisInvoice = 0
	for (i = 0; i < data.length; i++) {
		totalPayThisInvoice += data[i].Amount
	}
	return {promptMessage: `You've earned $${totalPayThisInvoice}.00 this invoice period.`, data}
}

module.exports = {
	addTimeToTask,
	subtractTimeFromTask,
	createNewTask,
	createNewItem,
	renameTask,
	startTask,
	deleteTask,
	updateSettings,
	displayStats,
	outputTodayHours,
	outputInvoiceHours,
	outputTodayPay,
	outputInvoicePay
}