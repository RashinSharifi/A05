const Sequelize = require("sequelize");
 var sequelize = new Sequelize(
   "dbmmvgsd",
 "dbmmvgsd",
  "jNc5T7rwmfz8nDWI-TiCVQ_QBEvVgvWK",
  {
     host: "lucky.db.elephantsql.com",
    dialect: "postgres",
     port: 5432,
    dialectOptions: {
      ssl: true,
     },
    query: { raw: true }, // update here, you. Need this
   }
 );

var sequelize = new Sequelize("web322", "postgres", "12wq", {
  host: "localhost",
  dialect: "postgres",
  port: 5432,
  query: { raw: true }, // update here, you. Need this
});

sequelize
  .authenticate()
  .then(() => console.log("Connection success."))
  .catch((err) => console.log("Unable to connect to DB.", err));

const Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
});

const Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to sync the datebase", err);
      });
  });
}

function getAllEmployees() {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((employees) => {
        if (employees.length === 0) reject("no result returned");
        resolve(employees);
      })
      .catch(() => reject("no results returned"));
  });
}

function addEmployee(employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;

    for (const property in employeeData) {
      value = employeeData[property];
      employeeData[property] = value === "" ? null : value;
    }

    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create employee");
      });
  });
}

function getEmployeesByStatus(status) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((employees) => {
        let filterdEmployees = employees.filter(
          (employee) => employee.status === status
        );
        if (filterdEmployees.length === 0) reject("no result returned");
        resolve(filterdEmployees);
      })
      .catch(() => reject("no results returned"));

    Employee.findAll({
      where: {
        status: status,
      },
    })
      .then((employees) => {
        if (employees.length === 0) reject("no result returned");
        resolve(employees);
      })
      .catch(() => reject("no results returned"));
  });
}

function getEmployeesByDepartment(department) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((employees) => {
        let filterdEmployees = employees.filter(
          (employee) => employee.department == department
        );

        if (filterdEmployees.length === 0) reject("no result returned");
        resolve(filterdEmployees);
      })
      .catch(() => reject("no results returned"));
  });
}

function getEmployeesByManager(manager) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((employees) => {
        let filterdEmployees = employees.filter(
          (employee) => employee.employeeManagerNum == manager
        );

        if (filterdEmployees.length === 0) reject("no result returned");
        resolve(filterdEmployees);
      })
      .catch(() => reject("no results returned"));
  });
}

function getEmployeeByNum(num) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((employees) => {
        let found = employees.find((employee) => employee.employeeNum == num);

        if (found) resolve(found);
        reject("no result returned");
      })
      .catch(() => reject("no results returned"));
  });
}

function getManagers() {
  return new Promise((resolve, reject) => {
    reject();
  });
}

function getDepartments() {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then((departments) => {
        console.log("xxx departments", departments);
        if (departments.length === 0) reject("no result returned");
        resolve(departments);
      })
      .catch(() => reject("no results returned"));
  });
}

function updateEmployee(employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;

    for (const property in employeeData) {
      value = employeeData[property];
      employeeData[property] = value === "" ? null : value;
    }

    Employee.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to update employee");
      });
  });
}

function addDepartment(departmentData) {
  return new Promise((resolve, reject) => {
    for (const property in departmentData) {
      value = departmentData[property];
      departmentData[property] = value === "" ? null : value;
    }

    console.log("xxx departmentData: ", departmentData);
    Department.create(departmentData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create department");
      });
  });
}

function updateDepartment(departmentData) {
  return new Promise((resolve, reject) => {
    for (const property in departmentData) {
      value = departmentData[property];
      departmentData[property] = value === "" ? null : value;
    }
    Department.update(departmentData, {
      where: { departmentId: departmentData.departmentId },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to update department");
      });
  });
}

function getDepartmentById(id) {
  return new Promise((resolve, reject) => {
    Department.findAll({ where: { departmentId: id } })
      .then((departments) => {
        resolve(departments[0]);
      })
      .catch(() => reject("no results returned"));
  });
}

function deleteEmployeeByNum(empNum) {
  return new Promise((resolve, reject) => {
    Employee.destroy({ where: { employeeNum: empNum } })
      .then(() => {
        resolve();
      })
      .catch(() => reject("Error on Delete"));
  });
}

module.exports = {
  initialize,
  getAllEmployees,
  getManagers,
  getDepartments,
  addEmployee,
  getEmployeesByStatus,
  getEmployeesByDepartment,
  getEmployeesByManager,
  getEmployeeByNum,
  updateEmployee,
  addDepartment,
  updateDepartment,
  getDepartmentById,
  deleteEmployeeByNum,
};
