import {
  AppBar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  AddCircleOutlineOutlined,
  SubjectOutlined,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { format } from "date-fns";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  page: {
    backgroundColor: "#f9f9f9",
    width: "100%",
    padding: theme.spacing(3),
  },
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  root: {
    display: "flex",
  },
  textStyle: {
    padding: theme.spacing(3),
  },
  active: {
    backgroundColor: "#f4f4f4",
  },
  appbar: {
    width: `calc(100% - ${drawerWidth}px)`,
  },
  toolbar: theme.mixins.toolbar,
  dateTime: {
    flexGrow: 1,
  },
}));

const listItems = [
  {
    text: "Add Sensor",
    icon: <AddCircleOutlineOutlined color="secondary" />,
    path: "/createSensor",
  },
  {
    text: "Add Device",
    icon: <AddCircleOutlineOutlined color="secondary" />,
    path: "/createLocation",
  },
  {
    text: "Add User",
    icon: <AddCircleOutlineOutlined color="secondary" />,
    path: "/createUser",
  },
  {
    text: "User Logs",
    icon: <AddCircleOutlineOutlined color="secondary" />,
    path: "/userLogs",
  },
];

const days = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};
const date = new Date();
const day = days[date.getDay()];

export const Layout = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  function isLoggedIn() {
    const token = localStorage.getItem("token");
    return token !== null && token !== "undefined";
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    const tokenStr = localStorage.getItem("token");

    if (!tokenStr || tokenStr === "undefined") {
      handleLogout();
      return;
    }

    let token;
    try {
      token = JSON.parse(tokenStr);
    } catch (error) {
      handleLogout();
      return;
    }

    fetch("/accounts/getUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access}`,
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.code === "token_not_valid") {
          handleLogout();
        } else {
          setUserDetails(data);
        }
      })
      .catch(() => {
        // In case fetch fails
        handleLogout();
      });
  }, []);

  return (
    <div className={classes.root}>
      {/* App bar */}
      <AppBar className={classes.appbar} elevation={0} color="secondary">
        <Toolbar>
          <Typography className={classes.dateTime}>
            {format(new Date(), "do MMMM Y") + " | " + day}
          </Typography>
          <Typography>
            Hi,{" "}
            {userDetails
              ? `${userDetails.name} ${userDetails.is_staff ? "(Admin)" : ""}`
              : "Login first"}
          </Typography>
          <Button
            variant="outlined"
            style={{
              backgroundColor: "#ff1744",
              color: "white",
              marginLeft: "7px",
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        anchor="left"
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
      >
        <div>
          <Typography variant="h5" className={classes.textStyle}>
            Sensor Moniter
          </Typography>
        </div>

        {/* List / Links */}
        <List>
          <ListItem
            button
            onClick={() => history.push("/")}
            className={location.pathname === "/" ? classes.active : null}
          >
            <ListItemIcon>
              <SubjectOutlined color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary={userDetails && userDetails.is_staff ? "All Devices" : "My Devices"}
            />
          </ListItem>

          {userDetails && userDetails.is_staff
            ? listItems.map((item) => (
                <ListItem
                  key={item.text}
                  button
                  onClick={() => history.push(item.path)}
                  className={location.pathname === item.path ? classes.active : null}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))
            : null}
        </List>
      </Drawer>

      <div className={classes.page}>
        <div className={classes.toolbar}></div>
        {children}
      </div>
    </div>
  );
};
