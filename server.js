// requiring all dependencies for import
var inquirer = require("inquirer");
var consoleTable = require("console.table");
var mysql = require("mysql");

// creating server connetion and assigning port
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "employee_db"
});
// creating function to display an error
connection.connect(function (err) {
  if (err) throw err;
  executeSearch();
});
// writing function to run search based on parameters input via choice
function executeSearch() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["View all employees",
        "View all departments",
        "View all managers",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "Exit"]

    })

    // allows user to select subcategories based on selected choices

    .then(function (answer) {
      console.log(answer.action);
      //   console.table(employee_db);
      switch (answer.action) {
        case "View all employees":
          viewEmployees();
          break;

        case "View all departments":
          viewDepartment();
          break;

        case "View all managers":
          viewManager();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateEmployee();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}
// allow users to view table based on the selected name 

function viewEmployees() {
  // inquirer
  //   .prompt({
  //     name: "viewEmployees",
  //     type: "input",
  //     message: "What employee would you like to search for (by last name)?"

  //   })
  //   .then(function (answer) {
  //     var query = "SELECT first_name, last_name, id FROM employee WHERE ?";
  //     connection.query(query, { last_name: answer.viewEmployees }, function (err, res) {
  //       for (var i = 0; i < res.length; i++) {
  //         console.log("First Name: " + res[i].first_name + " || Last name: " + res[i].last_name + " || Id: " + res[i].id);
  //       }
  connection.query("SELECT * FROM employee", function (err, res) {
    console.table(res);
    executeSearch();
  })

  //     });
  //   });
}

// allow users to view table based on the selected department 

function viewDepartment() {
  var query = "SELECT name FROM department";
  connection.query(query, function (err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].name);

    }
    executeSearch();
  });
}

// allow users to view table based on the selected manager

function viewManager() {
  var query = "SELECT id, first_name, last_name FROM Employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL)";
  connection.query(query, function (err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].first_name + " " + res[i].last_name + " || Id: " + res[i].id);
    }

    executeSearch();
  });
}

// a function to add employee to the table

function addEmployee() {
  inquirer
    .prompt({
      name: "addEmployee",
      type: "input",
      message: ["To ADD an employee, enter Employee First Name then Last Name"]
    })

    .then(function (answer) {
      console.log(answer)
      var str = answer.addEmployee;
      var firstAndLastName = str.split(" ");
      console.log(firstAndLastName);
      var query = "INSERT INTO employee (first_name, last_name) VALUES ?";
      connection.query(query, [[firstAndLastName]], function (err, res) {

        executeSearch();
      });
    })
}
// a function to add department to the table

function addDepartment() {
  inquirer
    .prompt([{
      name: "addDepartment",
      type: "input",
      message: "To ADD a department, enter new department name"
    },])

    .then(function (res) {
      console.log(res)

      connection.query("INSERT INTO department (name) VALUE (?)", [res.addDepartment], function (err, res) {
      if(err) throw err;
      console.log("Successfully Added Department!");
      runSearch();

      });
    })
};

// function to add role to table for new employee or position

function addRole() {
  inquirer
    .prompt({
      name: "title",
      type: "input",
      message: ["Enter new role name"]
    })
    .then(function (answer) {
      var title = answer.title;

      inquirer
        .prompt({
          name: "salary",
          type: "input",
          message: ["Enter new role salary"]
        })
        .then(function (answer) {
          var salary = answer.salary;

          inquirer
            .prompt({
              name: "department_id",
              type: "input",
              message: ["Enter new role department id"]
            })
            .then(function (answer) {
              var department_id = answer.department_id;

              console.log(`title: ${title} salary: ${salary} department id: ${department_id}`);

              var query = "INSERT INTO role (title, salary, department_id) VALUES ?";
              connection.query(query, [[[title, salary, department_id]]], function (err, res) {
                if (err) {
                  console.log(err);
                }

                executeSearch();
              });
            })
        })
    })

}
// function to delete employee from database

function removeEmployee() {
  inquirer
    .prompt({
      name: "removeEmployee",
      type: "input",
      message: "To REMOVE an employee, enter the Employee id",

    })
    .then(function (answer) {
      console.log(answer);
      var query = "DELETE FROM employee WHERE ?";
      var newId = Number(answer.removeEmployee);
      console.log(newId);
      connection.query(query, { id: newId }, function (err, res) {

      });
    });
}
// function to update and employees role by using their id 

function updateEmployee() {
  console.log('updating emp');
  inquirer
    .prompt({
      name: "id",
      type: "input",
      message: "Enter employee id",
    })
    .then(function (answer) {
      var id = answer.id;

      inquirer
        .prompt({
          name: "roleId",
          type: "input",
          message: "Enter role id",
        })
        .then(function (answer) {
          var roleId = answer.roleId;

          var query = "UPDATE employee SET role_id=? WHERE id=?";
          connection.query(query, [roleId, id], function (err, res) {
            if (err) {
              console.log(err);
            }
            executeSearch();
          });
        });
    });
}
// function to update the manager for an employee

function employeeManager() {
  inquirer
    .prompt({
      name: "employeeManager",
      type: "input",
      message: "What employee would you like to update the manager for?",
      //choices: need to figure out if we want to pull this by employee and then prompt for manager name
    })
    .then(function (answer) {
      var query = "SELECT manager_id FROM employee WHERE ?";
      connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
          console.log(res[i].employee);
        }

        executeSearch();
      });
    });
}