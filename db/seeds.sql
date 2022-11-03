USE employee_db;

INSERT INTO departments (department_name)
VALUES ("Human Resources"),
       ("Sales"),
       ("Accounting"),
       ("Quality Assurance"),
       ("Corporate"),
       ("Other");

INSERT INTO roles (title, salary, department_id)
VALUES ("Salesman", 40, 2),
       ("Accountant", 50, 3),
       ("Regional Manager", 80, 5),
       ("Quality Inspector", 50, 4),
       ("Executive", 100, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Stanley", "Hudson", 1, 4),
       ("Angela", "Martin", 2, 4),
       ("Jim", "Halpert", 1, 4),
       ("Micheal", "Scott", 3, 5),
       ("Jan", "Levinson", 5, 5),
       ("Creed", "Bratton", 4, 4);