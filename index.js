require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql2')
const ctable = require("console.table")

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

},
);

db.connect((err) => {
    if (err) throw err;
    console.log(`Connected to the database.`)
    setTimeout(() => {
        selectTask()
    }, 100);
})


function selectTask() {
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Choose an option:',
                name: 'task',
                choices: [
                    'view all departments',
                    'view all roles',
                    'view all employees',
                    'add a department',
                    'add a role',
                    'add an employee',
                    'update an employee role',
                ],
            },
        ]).then((response) => {
            const { task } = response;

            switch (task) {
                case 'view all departments':
                    displayDepartments()
                    break;
                case 'view all roles':
                    displayRoles()
                    break;
                case 'view all employees':
                    displayEmployees()
                    break;
                case 'add a department':
                    addDepartment()
                    break;
                case 'add a role':
                    addRole()
                    break;
                case 'add an employee':
                    addEmployee()
                    break;
                case 'update an employee role':
                    updateEmployee()
                    break;
                default:
                    break;
            }
        })

}


const displayDepartments = () => {
    db.query('SELECT department_name AS Departments FROM departments;', function (err, result) {
        if (err) throw err;
        console.table(result)
        setTimeout(() => {
            selectTask()
        }, 10);
    })
}

const displayRoles = () => {
    db.query(`SELECT roles.title AS Title, roles.salary AS Salary, departments.department_name AS Department
    FROM roles 
    JOIN departments 
    ON roles.department_id = departments.id;`, function (err, result) {
        if (err) throw err;
        console.table(result)
        setTimeout(() => {
            selectTask()
        }, 10);
    })
}

const displayEmployees = () => {
    db.query(`SELECT CONCAT (employees.first_name, ' ', employees.last_name) AS Name, roles.title AS Title, departments.department_name AS Department, roles.salary AS Salary, CONCAT (manager.first_name, ' ', manager.last_name) AS Manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments on roles.department_id = departments.id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id;`, function (err, result) {
        if (err) throw err;
        console.table(result)
        setTimeout(() => {
            selectTask()
        }, 10);
    })
}

const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter new department name:',
                name: 'new_department_name',
            },
        ]).then((response) => {
            const { new_department_name } = response;

            let query = db.query(
                'INSERT INTO departments SET ?',
                { department_name: new_department_name }, (err, data) => {
                    if (err) throw err;
                })
            console.log('You have successfully added a new department!')
        }).then(() => {
            selectTask()
    })
}

const addRole = () => {
    db.query('SELECT department_name FROM departments', function (err, results) {
        const departments = results.map((department) => department.department_name);

        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Enter new role title:',
                    name: 'new_title',
                },
                {
                    type: 'input',
                    message: 'Enter salary for new role:',
                    name: 'new_salary',
                },
                {
                    type: 'list',
                    message: 'Select a department for this new role:',
                    name: 'new_department',
                    choices: departments,
                },
            ]).then((response) => {
                db.query(`SELECT departments.id FROM departments WHERE departments.department_name 
                 = '${response.new_department}'`, function (err, results) {
                    db.query(`INSERT INTO roles (title, department_id, salary)
                    VALUES
                    ('${response.new_title}','${results[0].id}','${response.new_salary}');`,
                        function (err, results) {
                            selectTask();
                        })
                })
            })
    })
}

const addEmployee = () => {
    db.query('SELECT title FROM roles', function (err, results) {
        const roles = results.map((role) => role.title);

        db.query(`SELECT CONCAT (employees.first_name, ' ', employees.last_name) AS employee FROM employees`, function (err, results) {
            const managers = results.map((manager) => manager.employee);


            inquirer
                .prompt([
                    {
                        type: 'input',
                        message: 'Enter new employee first name:',
                        name: 'new_first_name',
                    },
                    {
                        type: 'input',
                        message: 'Enter new employee last name:',
                        name: 'new_last_name',
                    },
                    {
                        type: 'list',
                        message: 'Select a role for this new employee:',
                        name: 'new_role',
                        choices: roles,
                    },
                    {
                        type: 'list',
                        message: 'Select a manager for this new employee:',
                        name: 'new_manager',
                        choices: managers,
                    },
                ]).then((response) => {
                    db.query(`SELECT roles.id FROM roles WHERE roles.title = '${response.new_role}'`, function (err, results) {
                        const newRoleId = results[0].id;

                        db.query(`SELECT employees.id FROM employees WHERE CONCAT (employees.first_name, ' ', employees.last_name) = '${response.new_manager}'`, function (err, results) {
                            const newManagerId = results[0].id;

                            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
                    VALUES
                    ('${response.new_first_name}','${response.new_last_name}','${newRoleId}','${newManagerId}');`,
                                function (err, results) {
                                    selectTask();
                                })
                        })
                    })
                })
        })
    })
}

const updateEmployee = () => {
    db.query('SELECT title FROM roles', function (err, results) {
        const roles = results.map((role) => role.title);

        db.query(`SELECT CONCAT (employees.first_name, ' ', employees.last_name) AS employee FROM employees`, function (err, results) {
            const employees = results.map((manager) => manager.employee);


            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'Select an employee to update:',
                        name: 'new_employee',
                        choices: employees,
                    },
                    {
                        type: 'list',
                        message: 'Select a new role for this employee:',
                        name: 'new_role',
                        choices: roles,
                    },
                    {
                        type: 'list',
                        message: 'Select a new manager for this employee:',
                        name: 'new_manager',
                        choices: employees,
                    },
                ]).then((response) => {
                    db.query(`SELECT roles.id FROM roles WHERE roles.title = '${response.new_role}'`, function (err, results) {
                        const newRoleId = results[0].id;

                        db.query(`SELECT employees.id FROM employees WHERE CONCAT (employees.first_name, ' ', employees.last_name) = '${response.new_manager}'`, function (err, results) {
                            const newManagerId = results[0].id;

                            db.query(`UPDATE employees SET role_id = '${newRoleId}', manager_id = '${newManagerId}' WHERE CONCAT (employees.first_name, ' ', employees.last_name) = '${response.new_employee}'`,
                                function (err, results) {
                                    selectTask();
                                })
                        })
                    })
                })
        })
    })
}