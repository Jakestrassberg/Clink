var XLSX = require('xlsx');
var XLSXStyle = require('xlsx-style');
const timeParsingService = require('./timeParsingService')

const convertJSDateToExcelDate = (date) =>{
	var begingingOfTime = new Date('1900/01/01')
	var diff = date - begingingOfTime;  // difference in milliseconds
	var daysSinceBegingingOfTime = Math.ceil(diff / (1000 * 60 * 60 * 24) + 1)
	return daysSinceBegingingOfTime
}

function saveWorksheet(data) {
	// We have to make a copy or bad things will happen
	var taskData = JSON.parse(JSON.stringify(data))
	var workbook = XLSX.readFile('work_tracking.xlsx');
	for (var i = 0; i < taskData.length; i++) {
		taskData[i].Hours = timeParsingService.convertMinutesToPrettyString(taskData[i].Hours)
	}
	workbook.Sheets['Current Invoice Period'] = XLSX.utils.json_to_sheet(taskData)

	for (var i = 2; i < Object.keys(workbook.Sheets['Current Invoice Period']).length; i++) {

		// Format the 'Amount' column
		if (workbook.Sheets['Current Invoice Period'][`D${i}`]) {
			workbook.Sheets['Current Invoice Period'][`D${i}`].z = '$0.00' // Set the formatting
			XLSX.utils.format_cell(workbook.Sheets['Current Invoice Period'][`D${i}`]); // Refresh cell aka set the 'w' property ex: $1.00
		}
	}

	//console.log(workbook.Sheets['Current Invoice Period'])

	var wscols = [
		{ wch: 12 },
		{ wch: 45 },
		{ wch: 21 },
		{ wch: 10 }
	];

	workbook.Sheets['Current Invoice Period']['!cols'] = wscols; // Set column widths

	// The way dates work in Excel is that they're stored as a number
	// As far as Excel is concerned, 1/1/1900 is the begining of time
	// So 1/1/1900 = 1, 1/2/1900 = 2, etc.
	// There might be some way to do the below with Xlsx but its so complicated that its easier to do manually

	for (var i = 2; i < Object.keys(workbook.Sheets['Current Invoice Period']).length; i++) {
		if (workbook.Sheets['Current Invoice Period'][`A${i}`]) {
			// Using 'm/d/yyyy' because if you add a task via Excel there's no way to do m/d/yy and I want it consistant
			workbook.Sheets['Current Invoice Period'][`A${i}`].z = 'm/d/yyyy'
			XLSX.utils.format_cell(workbook.Sheets['Current Invoice Period'][`A${i}`])
		}
	}

	// XLSX is annoying because it'll mess up the formatting of the other sheet so we need to fix it
	// The z property was lost and the w was messed up
	// Can potientially skip the formatting for this sheet since we're not actually adding any rows
	// see: https://www.npmjs.com/package/xlsx#parsing-options
	for (var i = 2; i < Object.keys(workbook.Sheets['All Invoices']).length; i++) {
		// Format the 'Date Started' column
		if (workbook.Sheets['All Invoices'][`A${i}`]) {
			workbook.Sheets['All Invoices'][`A${i}`].z = 'm/d/yyyy'
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`A${i}`])
		}
		// Format the 'Amount' column
		if (workbook.Sheets['All Invoices'][`D${i}`]) {
			workbook.Sheets['All Invoices'][`D${i}`].z = '$0.00' // Set the formatting
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`D${i}`]); // Refresh cell aka set the 'w' property ex: $1.00
		}
		// Format the 'Invoice Sent' column
		if (workbook.Sheets['All Invoices'][`F${i}`]) {
			workbook.Sheets['All Invoices'][`F${i}`].z = 'm/d/yyyy'
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`F${i}`])
		}
		// Format the 'Total' column
		if (workbook.Sheets['All Invoices'][`G${i}`]) {
			workbook.Sheets['All Invoices'][`G${i}`].z = '$0.00'
			XLSX.utils.format_cell(workbook.Sheets['All Invoices'][`G${i}`]);
		}
	}

	var wscols = [
		{ wch: 12 },
		{ wch: 45 },
		{ wch: 21 },
		{ wch: 10 },
		{ wch: 14 },
		{ wch: 12 },
		{ wch: 10 }
	];

	// Fancy titles
	workbook.Sheets['Current Invoice Period'].A1.s = { font: { bold: true } }
	workbook.Sheets['Current Invoice Period'].B1.s = { font: { bold: true } }
	workbook.Sheets['Current Invoice Period'].C1.s = { font: { bold: true } }
	workbook.Sheets['Current Invoice Period'].D1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].A1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].B1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].C1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].D1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].E1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].F1.s = { font: { bold: true } }
	workbook.Sheets['All Invoices'].G1.s = { font: { bold: true } }
	
	workbook.Sheets['All Invoices']['!cols'] = wscols;
	XLSXStyle.writeFile(workbook, 'work_tracking.xlsx') // Using the other Excel Library
}

module.exports = {
    convertJSDateToExcelDate,
    saveWorksheet
}