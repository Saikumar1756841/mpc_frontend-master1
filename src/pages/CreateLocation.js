import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  makeStyles,
} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import { useHistory } from "react-router";
import { useAlert } from "react-alert";

const useStyles = makeStyles({
  btn: {
    color: "pink",
    backgroundColor: "blue",
    margin: "auto",
    "&:hover": {
      backgroundColor: "purple",
    },
  },
  title: {
    color: "blue",
    textDecoration: "underline",
  },
  field: {
    marginBottom: 21,
    marginLeft: 21,
  },
});

export default function CreateLocation() {
  const classes = useStyles();

  const [name, setName] = useState([]);
  const [nameError, setNameError] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [allUsers, setAllUsers] = useState(null);

  useEffect(() => {
    fetch("/accounts/getAllUsers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setAllUsers(data);
        return data;
      });
  }, []);

  const handleChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const clearText = () => {
    setName("");
    setSelectedUser("");
    setNameError(false);
  };

  const handleSubmitEvent = async (e) => {
  e.preventDefault();
  setNameError(false);

  if (name === "") {
    setNameError(true);
    return;
  }

  if (selectedUser === "") {
    alert("Select a user to continue");
    return;
  }

  const formData = {
    name: name,
    user: selectedUser,
  };

  try {
    const response = await fetch("/api/device/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.status === 200 || response.status === 201) {
      alert("Device Added Successfully!");
      clearText();
    } else {
      console.error("Server error response:", data);
      alert(data?.message || "Failed to add device");
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("Network error or server is down");
  }
};

  return (
    <React.Fragment>
      <Container>
        <Typography
          className={classes.field}
          variant="h5"
          align="left"
          component="h5"
          gutterBottom
          color="textSecondary"
        >
          Add a New Device
        </Typography>

        <form
          action=""
          noValidate
          autoComplete="off"
          onSubmit={handleSubmitEvent}
        >
          <TextField
            className={classes.field}
            onChange={(e) => setName(e.target.value)}
            label="Device Name"
            variant="outlined"
            fullWidth
            error={nameError}
            color="secondary"
            value={name}
            required
          />

          <FormControl
            variant="outlined"
            fullWidth
            required
            style={{ margin: "0px 0px 20px 20px" }}
          >
            <InputLabel>User</InputLabel>
            <Select label="User" value={selectedUser} onChange={handleChange}>
              {allUsers &&
                allUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            className={classes.field}
            type="submit"
            variant="contained"
            // disabled
            color="secondary"
          >
            Add Device
          </Button>
        </form>
      </Container>
    </React.Fragment>
  );
}
