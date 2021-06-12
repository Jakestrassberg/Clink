var inquirer = require('inquirer');
var XLSX = require('xlsx');
var XLSXStyle = require('xlsx-style');
const Handlebars = require('handlebars');
const pdf = require('html-pdf');
const fs = require('fs');
const moment = require('moment');
const displayTaskData = require('./displayTaskData')
const cmds = require('./commands')
const settingsService = require('./settingsService')
const timeParsingService = require('./timeParsingService')
const spreadsheetService = require('./spreadsheetService.js')
const themes = require('./themes')
var colorTheme = themes['defaultColors']
if (themes[settingsService.getSettings().theme]) {
	var colorTheme = themes[settingsService.getSettings().theme]
}
require('events').EventEmitter.prototype._maxListeners = 100;

var emptyPrompt = [
	{
		type: 'input',
		name: 'emptyPrompt',
		prefix: colorTheme.you('You:'),
		message: ' '
	},
];

var initialSettingsQuestions = [
	{
		type: 'input',
		name: 'hourlyPay',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'Please enter your hourly pay rate',
		validate: function (value) {
			if (value != '') {
				return true
			}
		}
	},
	{
		type: 'input',
		name: 'nextInvoiceDate',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'When do you have to submit your next invoice? Format: M/D/YY',
		validate: function (value) {
			if (value != '') {
				return true
			}
		}
	},
	{
		type: 'input',
		name: 'invoiceNumber',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'What number invoice are you currently on?',
		validate: function (value) {
			if (value != '') {
				return true
			}
		}
	},
	{
		type: 'input',
		name: 'invoiceDirectory',
		prefix: colorTheme.clinkName('Clink: '),
		message: 'Where should I save invoices?',
		validate: function (value) {
			if (value != '') {
				return true
			}
		}
	}
];


function generateInvoice(data, args) {
	console.log('\033[2J')
	var taskData = JSON.parse(JSON.stringify(data))

	// We want to provide some feedback but don't want to prompt for input
	displayTaskData(taskData)
	console.log(colorTheme.clinkName('Clink: '), colorTheme.clinkOutput('Generating the invoice...'))

	var html = fs.readFileSync('./invoice_template/invoice_template.html', 'utf8');
	var template = Handlebars.compile(html)

	var totalPay = 0
	for (i = 0; i < taskData.length; i++) {
		totalPay += taskData[i].Amount
	}

	var updatedSettings = settingsService.getSettings()
	updatedSettings.nextInvoiceDate = moment(settingsService.getSettings().nextInvoiceDate, 'M/D/YY').add(14, 'day').format('M/D/YY')
	var workbook = XLSX.readFile('work_tracking.xlsx');
	var allInvoicesJSON = XLSX.utils.sheet_to_json(workbook.Sheets['All Invoices'], {})

	// Add the current invoice sheet to the all invoices sheet
	allInvoicesJSON.push({ ['Date Started']: '', Task: '', Hours: '', Amount: '' }) // Just makes an empty row
	taskData.forEach(function (task) {
		//task.Invoice_Notes = ''
		task = JSON.parse(JSON.stringify(task))
		task.Hours = timeParsingService.convertMinutesToPrettyString(task.Hours)
		allInvoicesJSON.push(task)
	})

	// Have to make the format nice for the spreadsheet and invoice
	for (var i = 0; i < taskData.length; i++) {
		taskData[i].Hours = timeParsingService.convertMinutesToPrettyString(taskData[i].Hours)
		var dateInPrettyFormat = new Date(Math.round((taskData[i]['Date Started'] - 25568) * 86400 * 1000))
		taskData[i]['Date Started'] = moment(dateInPrettyFormat).format('M/D/YY')
	}

	allInvoicesJSON[allInvoicesJSON.length - 1]['Invoice Number'] = settingsService.getSettings().invoiceNumber
	allInvoicesJSON[allInvoicesJSON.length - 1]['Invoice Sent'] = spreadsheetService.convertJSDateToExcelDate(new Date())
	allInvoicesJSON[allInvoicesJSON.length - 1].Total = totalPay
	workbook.Sheets['Current Invoice Period'] = XLSX.utils.json_to_sheet([]) // Just to clear it
	workbook.Sheets['All Invoices'] = XLSX.utils.json_to_sheet(allInvoicesJSON)

	// Start with 2 because we don't want the title cell
/*	for (var i = 2; workbook.Sheets['All Invoices'][`D${i}`]; i++) {
		workbook.Sheets['All Invoices'][`D${i}`].z = '$0.00' // Set the formatting
		XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`D${i}`]); // Refresh cell aka set the 'w' property ex: $1.00
	}*/

	for (var i = 2; i < Object.keys(workbook.Sheets['All Invoices']).length; i++) {
		if (workbook.Sheets['All Invoices'][`A${i}`]) {
			// Using 'm/d/yyyy' because if you add a task via Excel there's no way to do m/d/yy and I want it consistant
			workbook.Sheets['All Invoices'][`A${i}`].z = 'm/d/yyyy'
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`A${i}`])
		}
		if (workbook.Sheets['All Invoices'][`D${i}`]) {
			workbook.Sheets['All Invoices'][`D${i}`].z = '$0.00' // Set the formatting
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`D${i}`]); // Refresh cell aka set the 'w' property ex: $1.00
		}
		if (workbook.Sheets['All Invoices'][`F${i}`]) {
			// Using 'm/d/yyyy' because if you add a task via Excel there's no way to do m/d/yy and I want it consistant
			workbook.Sheets['All Invoices'][`F${i}`].z = 'm/d/yyyy'
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`F${i}`])
		}
		if (workbook.Sheets['All Invoices'][`G${i}`]) {
			workbook.Sheets['All Invoices'][`G${i}`].z = '$0.00' // Set the formatting
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`G${i}`]); // Refresh cell aka set the 'w' property ex: $1.00
		}
	}
	//console.log(workbook.Sheets['All Invoices'])

	var wscols = [
		{ wch: 12 },
		{ wch: 45 },
		{ wch: 21 },
		{ wch: 10 },
		{ wch: 14 },
		{ wch: 12 },
		{ wch: 10 }
	];

	workbook.Sheets['All Invoices']['!cols'] = wscols;

	// Fancy titles
	workbook.Sheets['All Invoices'].A1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].B1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].C1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].D1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].E1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].F1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].G1.s = { font: { bold: true } }

	// Have to convert to a nice format for the invoice
	for (var i = 0; i < taskData.length; i++) {
		taskData[i].Amount = '$' + data[i].Amount.toFixed(2)
	}

	var invoiceHTML = template({ 'invoiceNumber': updatedSettings.invoiceNumber, 'invoiceDate': moment().format('M/D/YY'), 'taskData': taskData, 'amountDue': '$' + totalPay })
	pdf.create(invoiceHTML, { format: 'letter', "base": "file:///" + __dirname + "//invoice_template//" }).toFile(`${updatedSettings.invoiceDirectory}/Invoice#${updatedSettings.invoiceNumber} ${moment().format('M-D-YY')}.pdf`, function (err, res) {
		if (!err) {
			console.log('\033[2J')
			// In test mode it'll generate the invoice but wont modify the excel sheet, settings, etc.
			if (args.test == false) {
				updatedSettings.invoiceNumber += 1
				settingsService.writeSettings(updatedSettings)
				XLSXStyle.writeFile(workbook, 'work_tracking.xlsx') // Using the other Excel Library
				mainPrompt('Invoice created: ' + res.filename, [])
			} else {
				mainPrompt('Invoice created: ' + res.filename, data)
			}
			require('child_process').exec('start "" ' + updatedSettings.invoiceDirectory)
		}
	});
}

// keywords.json is formatted as "action":["required_keyword", ["possible_keyword", "possible_keyword"]]
// where "required_keyword" has to be in the input as well as one of the possible keywords 

function evaluateKeywords(input) {
	var rawdata = fs.readFileSync(__dirname + '/keywords.json')
	var keywords = JSON.parse(rawdata);
	var input = input.split(' ')
	for (var property in keywords) { // for each action
		var matchSucceded = false
		for (var i = 0; i < keywords[property].length; i++) { // for each keyword
			var matchFailed = false
			if (Array.isArray(keywords[property][i])) { // for each "possible_keyword"
				for (var ii = 0; ii < keywords[property][i].length; ii++) {
					//console.log(keywords[property][i][ii])
					if (input.includes(keywords[property][i][ii])) {
						break
					}
					if ((ii + 1) == keywords[property][i].length) {
						matchFailed = true
					}
				}
			} else if (!input.includes(keywords[property][i])) {
				matchFailed = true
			}
			// console.log(keywords[property][i], matchFailed)
			if (matchFailed) {
				break
			} else if ((i + 1) == keywords[property].length) {
				matchSucceded = true
			}
		}
		if (matchSucceded) {
			break
		}
	}
	
	if (matchSucceded) {
		return property
	} else {
		return null
	}
}

function mainPrompt(message, data, dataBeforeLastEdit) {
	displayTaskData(data)
	if (message != null) {
		console.log(colorTheme.clinkName('Clink: '), colorTheme.clinkOutput(message))
	}
	
	inquirer.prompt(emptyPrompt).then(answer => {
		answer = answer.emptyPrompt
		answer = answer.toLowerCase()
		var answerSplit = answer.split(' ')

		if (!answerSplit.includes('undo')) { // we don't want to overwrite dataBeforeLastEdit if we are about to use it to undo
			dataBeforeLastEdit = JSON.parse(JSON.stringify(data))
		}

		switch (evaluateKeywords(answer)) {
			case "createNewTask":
				cmds.createNewTask(data).then(
					function(response) {
						spreadsheetService.saveWorksheet(response.data)
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "createNewItem":
				cmds.createNewItem(data).then(
					function(response) {
						spreadsheetService.saveWorksheet(response.data)
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "renameTask":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				cmds.renameTask(data, selectedTaskIndex).then(
					function(response) {
						spreadsheetService.saveWorksheet(response.data)
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "startTask":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				cmds.startTask(data, selectedTaskIndex).then(
					function(response) {
						spreadsheetService.saveWorksheet(response.data)
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "addTimeToTaskVersionOne":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				var timeToAdd = timeParsingService.convertPrettyStringToMinutes(answer)
				if (timeToAdd != 'error') {
					let response = cmds.addTimeToTask(data, selectedTaskIndex, timeToAdd)
					spreadsheetService.saveWorksheet(response.data)
					console.log('\033[2J')
					mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
				} else {
					mainPrompt(`I'm sorry, I cannot "${answer}".`, data)
				}
				return
			case "addTimeToTaskVersionTwo":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				var timeToAdd = timeParsingService.convertTimePeriodToMinutes(answerSplit[answerSplit.length - 6], answerSplit[answerSplit.length - 4])
				if (timeToAdd != 'error') {
					let response = cmds.addTimeToTask(data, selectedTaskIndex, timeToAdd)
					spreadsheetService.saveWorksheet(response.data)
					console.log('\033[2J')
					mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
				} else {
					mainPrompt(`I'm sorry, I cannot "${answer}".`, data)
				}
				return
			case "undo":
				if (dataBeforeLastEdit) {
					spreadsheetService.saveWorksheet(dataBeforeLastEdit)
					console.log('\033[2J')
					mainPrompt('Last edit has been undone.', dataBeforeLastEdit)
				} else {
					console.log('\033[2J')
					mainPrompt("I'm sorry, I cannot do that.", data)
				}
				return
			case "deleteTask":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				cmds.deleteTask(data, selectedTaskIndex).then(
					function(response) {
						spreadsheetService.saveWorksheet(response.data)
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "subtractTimeFromTask":
				var selectedTaskIndex = parseInt(answerSplit[answerSplit.length - 1] - 1)
				var timeToSubtract = timeParsingService.convertPrettyStringToMinutes(answer)
				let response = cmds.subtractTimeFromTask(data, selectedTaskIndex, timeToSubtract)
				spreadsheetService.saveWorksheet(response.data)
				console.log('\033[2J')
				mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
				return
			case "displayStats":
				cmds.displayStats().then(()=> {
					console.log('\033[2J')
					mainPrompt(null, data)
				})
				return
			case "outputTodayHours":
				cmds.outputTodayHours(data).then(
					function(response) {
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "outputInvoiceHours":
				cmds.outputInvoiceHours(data).then(
					function(response) {
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "outputTodayPay":
				cmds.outputTodayPay(data).then(
					function(response) {
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "outputInvoicePay":
				cmds.outputInvoicePay(data).then(
					function(response) {
						console.log('\033[2J')
						mainPrompt(response.promptMessage, response.data, dataBeforeLastEdit)
					}
				)
				return
			case "generateTestInvoice":
				generateInvoice(data, { test: true })
				return
			case "generateInvoice":
				generateInvoice(data, { test: false })
				return
			case "updatedSettings":
				cmds.updateSettings().then(
					function() {
						console.log('\033[2J')
						mainPrompt("Settings Updated.", data, dataBeforeLastEdit)
					}
				)
				return
			case null:
				console.log('\033[2J')
				mainPrompt('I do not understand ' + '"' + answer + '".', data)
				return
		}
	})
}

function init() {
	// Have to make the tracking file if it isn't already there
	try {
		var workbook = XLSX.readFile('work_tracking.xlsx', {});
	} catch {
		fs.copyFileSync(__dirname + '/work_tracking_empty.xlsx', __dirname + '/work_tracking.xlsx')
		var workbook = XLSX.readFile('work_tracking.xlsx', {});
	}
	var sheetNames = workbook.SheetNames
	var currentDateFormatted = moment().format('MM-DD-YY')

	// Backup the Excel on every launch
	var backupFileName = `work_tracking_${currentDateFormatted}_1`
	var i = 2
	while (fs.existsSync(`./work_tracking_backups/${backupFileName}.xlsx`)) { // So we don't use the same name and overwrite the file
		backupFileName = `work_tracking_${currentDateFormatted}_${i}`
		i++
	}

	if (!fs.existsSync('./work_tracking_backups')) {
		fs.mkdirSync('./work_tracking_backups', { recursive: true });
	}
	fs.copyFile('./work_tracking.xlsx', `./work_tracking_backups/${backupFileName}.xlsx`, function (err) {
		if (err) {
			console.log("Couldn't backup Excel sheet: ", err)
		}
	})

	// Fix the formatting
	var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
	for (var i = 0; i < data.length; i++) {
		// There may be no hours cell if someone edited the Excel sheet manually
		if (data[i].Hours) {
			data[i].Hours = timeParsingService.convertPrettyStringToMinutes(data[i].Hours)
		} else {
			data[i].Hours = 0
		}
	}

	if (!fs.existsSync(__dirname + '/settings.json')) {
		settingsService.generateSettingsFile()
		inquirer.prompt(initialSettingsQuestions).then(answer => {
			var updatedSettings = settingsService.getSettings()
			updatedSettings.configured = true
			answer.hourlyPay.replace('$', '')
			updatedSettings.minutelyPay = answer.hourlyPay / 60
			updatedSettings.nextInvoiceDate = answer.nextInvoiceDate
			updatedSettings.invoiceNumber = parseInt(answer.invoiceNumber)
			updatedSettings.invoiceDirectory = answer.invoiceDirectory
			settingsService.writeSettings(updatedSettings)
			console.log('\033[2J')
			mainPrompt("Nice to meet you! I'm Clink.", data)
		})
	} else {
		var today = new Date()
		if (settingsService.getSettings().todayInfo.date != today.toDateString()) {
			var updatedSettings = settingsService.getSettings()
			updatedSettings.todayInfo.date = today.toDateString()
			updatedSettings.todayInfo.minutesAdded = 0
			settingsService.writeSettings(updatedSettings)
		}
		// Calc days until next invoice (this would be really gross using moment.js)
		// Really racked my brain for this...
		var d2 = new Date(moment(settingsService.getSettings().nextInvoiceDate, 'M/D/YY').format('YYYY/MM/DD'))
		var diff = d2 - today;  // difference in milliseconds
		var daysUntilNextInvoice = Math.ceil(diff / (1000 * 60 * 60 * 24))
		if (daysUntilNextInvoice <= 3) {
			if (daysUntilNextInvoice < 1) {
				mainPrompt('Invoice is due today.', data)
			} else if (daysUntilNextInvoice == 1) {
				mainPrompt('Invoice is due tomorrow.', data)
			} else if (daysUntilNextInvoice == 2) {
				mainPrompt('Invoice is due in two days.', data)
			} else {
				mainPrompt('Invoice is due in three days.', data)
			}
		} else {
			var welcomeTexts = ['Hello! How can I help you?', 'What can I do for you today?', 'Welcome!']
			var randomIndex = Math.floor(Math.random() * welcomeTexts.length)
			mainPrompt(welcomeTexts[randomIndex], data)
		}
	}
}


console.log('\033[2J')
init()