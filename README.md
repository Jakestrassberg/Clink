# Clink
A CLI tool for tracking work hours and generating invoices.

# Why?
I work as an independent contractor and was logging my work hours using Excel. Manually recording tasks, hours, and generating invoices took too much time.

# How does it work?
Although Clink is a command line tool, it functions like a chatbot meaning that commands can be typed in plain english and don't require perfect syntax. All the task, time, and pay information is stored as an Excel file and can be manually edited. Clink can generate PDF invoices using the default HTML invoice template or a custom one.

# Getting Started
1. Run npm install
2. Run npm start
3. Follow prompts

# Command Examples
* Create new task
* Add 1 hour and 30 minutes to task 1
* Worked from 1 to 2 on task 1
* Start task 1
* Rename task 1
* Delete task 1
* Subtract 1 hour and 30 minutes from task 1
* Undo
* How many hours have I worked today?
* How much money have I earned today?
* Hours many hours have I worked since the last invoice?
* How much money have I earned since the last invoice?
* Generate invoice
* Edit settings

# Invoices
The template for making invoices can be found at Clink\invoice_template\invoice_template.html. You can edit this file to include your personal information or replace the file entirely. Clink uses HandlebarsJS for templating.