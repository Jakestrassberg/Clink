const chalk = require('chalk');

const defaultColors = {
	taskNumber: chalk.rgb(204, 204, 204),
	taskDate: chalk.rgb(204, 204, 204),
	taskDescription: chalk.rgb(204, 204, 204),
	taskTime: chalk.rgb(204, 204, 204),
	taskAmount: chalk.rgb(204, 204, 204),
	accent: chalk.rgb(204, 204, 204),
	clinkName: chalk.rgb(251, 182, 31),
	clinkOutput: chalk.rgb(251, 182, 31),
	you: chalk.rgb(0, 190, 237)
}

const blueAndPurple = {
	taskNumber: chalk.rgb(174, 129, 255),
	taskDate: chalk.rgb(0, 190, 237),
	taskDescription: chalk.rgb(174, 129, 255),
	taskTime: chalk.rgb(0, 190, 237),
	taskAmount: chalk.rgb(174, 129, 255),
	accent: chalk.rgb(0, 190, 237),
	clinkName: chalk.rgb(251, 182, 31),
	clinkOutput: chalk.rgb(251, 182, 31),
	you: chalk.rgb(204, 204, 204)
}

const monokai = {
	taskNumber: chalk.rgb(236, 39, 60),
	taskDate: chalk.rgb(82, 227, 239),
	taskDescription: chalk.rgb(161, 129, 255),
	taskTime: chalk.rgb(82, 227, 239),
	taskAmount: chalk.rgb(166, 226, 45),
	accent: chalk.rgb(0, 190, 237),
	clinkName: chalk.rgb(230, 219, 116),
	clinkOutput: chalk.rgb(230, 219, 116),
	you: chalk.rgb(253, 151, 32)
}

const highSaturation = {
	taskNumber: chalk.rgb(255, 55, 23),
	taskDate: chalk.rgb(151, 138, 249),
	taskDescription: chalk.rgb(204, 204, 204),
	taskTime: chalk.rgb(204, 204, 204),
	taskAmount: chalk.rgb(61, 203, 52),
	accent: chalk.rgb(0, 190, 237),
	clinkName: chalk.rgb(251, 182, 31),
	clinkOutput: chalk.rgb(251, 182, 31),
	you: chalk.rgb(0, 190, 237)
}

module.exports = {
    defaultColors,
    blueAndPurple,
	monokai,
    highSaturation
}