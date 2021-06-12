const fs = require('fs');

const writeSettings = (settings) => {
	fs.writeFileSync(__dirname + '/settings.json', JSON.stringify(settings))
}

const generateSettingsFile = () => {
	var settings = {
		"configured": false,
		"theme":"defaultColors",
		"minutelyPay": 0,
		"nextInvoiceDate": "",
		"invoiceNumber": 0,
		"invoiceDirectory": "", "lastTenTimesAdded": [],
		"todayInfo": { "minutesAdded": 0, "date": "Fri Apr 24 2020" }
	}
	writeSettings(settings)
}

const getSettings = () => {
	if (fs.existsSync(__dirname + '/settings.json')) {
		var rawdata = fs.readFileSync(__dirname + '/settings.json')
		var settings = JSON.parse(rawdata);
		return settings
	} else {
		return {}
	}

}


module.exports = {
	generateSettingsFile,
	getSettings,
	writeSettings
}