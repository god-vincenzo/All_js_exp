import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const employees = [
    { id: 1, name: "Harshit" }
];

let nextEmpId = 2;

function handleInput(choice) {
    switch (choice.trim()) {
        case "1":
            rl.question("Enter Your Name: ", (name) => {
                const newEmp = {
                    id: nextEmpId++,
                    name: name.trim(),
                };
                employees.push(newEmp);
                console.log(`Employee ID: ${newEmp.id} | Name: ${newEmp.name} added.`);
                showMenu();
            });
            break;

        case "2":
            if (employees.length === 0) {
                console.log("No employees to display.");
            } else {
                employees.forEach((emp, index) => {
                    console.log(`${index + 1}. Employee ID: ${emp.id} | Name: ${emp.name}`);
                });
            }
            showMenu();
            break;

        case "3":
            rl.question("Enter employee ID to remove: ", (id) => {
                const empId = parseInt(id.trim(), 10);
                const index = employees.findIndex(emp => emp.id === empId);
                if (index !== -1) {
                    employees.splice(index, 1);
                    console.log(`Employee ID: ${empId} removed.`);
                } else {
                    console.log(`Employee with ID ${empId} not found.`);
                }
                showMenu();
            });
            break;

        case "4":
            console.log("Exiting Employee Management System.");
            rl.close();
            break;

        default:
            console.log("Invalid choice. Please enter 1, 2, 3, or 4.");
            showMenu();
    }
}

function showMenu() {
    console.log("\nEmployee Management System");
    console.log("1. Add Employee");
    console.log("2. List Employees");
    console.log("3. Remove Employee");
    console.log("4. Exit");
    rl.question("\nEnter Your Choice: ", handleInput);
}

showMenu();
