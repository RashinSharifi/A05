/***********************************************************************************************
 * WEB322-Assignment 5
 * Ideclare that this assignment is my own work in accordance with Seneca Acdemic Policy.
 * No part of this assigment has been copied manually or electronically from any other source.
 * (including web sites)or distributed to other students.
 *
 * Name: Rashin Sharifi  Student ID:150653210   Date:26-nov-2022
 *
 * Online (Cyclic) URL:
 * https://shiny-cyan-turtle.cyclic.app
 ***********************************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var dataservice = require("./data-service");

const fs = require("fs");

var multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));

const exphbs = require("express-handlebars");
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href=" ' +
          url +
          ' ">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  //  res.sendFile(__dirname + "/views/home.html");
  res.render("home", {
    layout: "main",
  });
});
app.get("/about", (req, res) => {
  // res.sendFile(__dirname + "/views/about.html");
  res.render("about", {
    layout: "main",
  });
});

app.get("/images/add", (req, res) => {
  //   res.sendFile(__dirname + "/views/addImage.html");
  res.render("addImage", {
    layout: "main",
  });
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, items) {
    if (err) {
      res.send("Server internal error!");
    } else {
      let jsonMessage = { images: [] };
      items.forEach(function (item) {
        jsonMessage.images.push(item);
      });
      // res.send(JSON.stringify(jsonMessage));
      // res.json(jsonMessage)
      res.render("images", jsonMessage);
    }
  });
  // res.json()
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    dataservice
      .getEmployeesByStatus(req.query.status)
      .then((result) => {
        res.render("employees", { employees: result });
      })
      .catch((message) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.department) {
    dataservice
      .getEmployeesByDepartment(req.query.department)
      .then((result) => {
        if (result.length > 0) {
          res.render("employees", { employees: result });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((message) => {
        res.render("employees", { message: message });
      });
  } else if (req.query.manager) {
    dataservice
      .getEmployeesByManager(req.query.manager)
      .then((result) => {
        res.render("employees", { employees: result });
      })
      .catch((message) => {
        res.render("employees", { message: "no results" });
      });
  } else {
    dataservice
      .getAllEmployees()
      .then(function (result) {
        // res.send(result);
        res.render("employees", { employees: result });
      })
      .catch(function (message) {
        // var myjson={};
        // myjson["message"]=message;
        // res.send(JSON.stringify(myjson));

        // res.render({message: message});
        res.render("employees", { message: message });
      });
  }
});

app.post("/employee/update", (req, res) => {
  // console.log(req.body);
  // res.redirect("/employees");
  dataservice
    .updateEmployee(req.body)
    .then(() => res.redirect("/employees"))
    .catch((err) => {
      res.status(500).send("Unable to Update Employee");
    });
});

app.get("/employee/:empNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  dataservice
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data; //store employee data in the "viewData" object as "employee"
      } else {
        viewData.employee = null; // set employee to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; // set employee to null if there was an error
    })
    .then(dataservice.getDepartments)
    .then((data) => {
      console.log("xxxxxx data", data);
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    });
});

app.get("/employees/add", (req, res) => {
  // res.sendFile(__dirname + "/views/addEmployee.html");
  dataservice
    .getDepartments()
    .then((data) => {
      res.render("addEmployee", {
        layout: "main",
        departments: data,
      });
    })
    .catch(() => res.render("addEmployee", { departments: [] }));
});

app.post("/employees/add", (req, res) => {
  dataservice
    .addEmployee(req.body)
    .then(function (result) {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add Employee");
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
  dataservice
    .deleteEmployeeByNum(req.params.empNum)
    .then(res.redirect("/employees"))
    .catch(() => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/departments/add", (req, res) => {
  res.render("addDepartment", {
    layout: "main",
  });
});

app.post("/departments/add", (req, res) => {
  dataservice
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to add Department");
    });
});

app.post("/departments/update", (req, res) => {
  dataservice
    .updateDepartment(req.body)
    .then(() => res.redirect("/departments"))
    .catch((err) => {
      res.status(500).send("Unable to update Department");
    });
});

app.get("/department/:departmentId", (req, res) => {
  dataservice
    .getDepartmentById(req.params.departmentId)
    .then((result) => {
      // let department = result.dataValues;
      if (result) {
        res.render("department", { department: result });
      } else {
        res.status(404).send("Department Not Found");
      }
    })
    .catch(() => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/departments", (req, res) => {
  dataservice
    .getDepartments()
    .then(function (result) {
      // let departments = result.dataValues;
      res.render("departments", { departments: result });
    })
    .catch(function (message) {
      res.render("departments", { message: message });
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

dataservice
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT);
  })
  .catch(function () {
    console.log("initialized failed");
  });
