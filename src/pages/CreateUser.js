import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Container,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  makeStyles,
  CircularProgress,
  Snackbar,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles({
  field: {
    marginBottom: 21,
    marginLeft: 21,
  },
  btn: {
    margin: "20px",
    backgroundColor: "blue",
    color: "white",
    "&:hover": {
      backgroundColor: "purple",
    },
  },
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function CreateUser() {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tc, setTc] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [allSensors, setAllSensors] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: '', message: '' });
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/api/sensorDataAPI/`)
      .then((res) => res.json())
      .then((data) => setAllSensors(data))
      .catch((err) => console.error("Sensor fetch error:", err));
  }, []);

  const handleSensorChange = (event) => {
    setSelectedSensors(event.target.value);
  };

  const validatePassword = (pwd) => {
    return (
      pwd.length >= 8 &&
      isNaN(pwd) &&
      !pwd.toLowerCase().includes(name.toLowerCase()) &&
      !["password", "12345678", "qwerty"].includes(pwd)
    );
  };

  const clearForm = () => {
    setEmail("");
    setName("");
    setTc(false);
    setPassword("");
    setConfirmPassword("");
    setSelectedSensors([]);
    setIsAdmin(false);
    setEmailError(false);
    setNameError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setEmailError(!email);
    setNameError(!name);
    setPasswordError(!validatePassword(password));
    setConfirmPasswordError(password !== confirmPassword);

    if (
      email &&
      name &&
      validatePassword(password) &&
      password === confirmPassword
    ) {
      const userData = {
        email,
        name,
        tc,
        password,
        confirmPassword,
        sensors: selectedSensors,
        is_admin: isAdmin
      };

      try {
            const response = await fetch(`${BASE_URL}/api/createUserWithSensors/`, {
            method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify(userData),
  });

  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text(); // capture the actual HTML error
    console.error("Non-JSON response:", text);
    throw new Error("Received non-JSON response");
  }

  const result = await response.json();


        if (response.ok) {
          setSnack({ open: true, severity: 'success', message: "User created and sensors assigned successfully!" });
          clearForm();
        } else {
          setSnack({ open: true, severity: 'error', message: `Error: ${result.detail || JSON.stringify(result)}` });
        }
      } catch (err) {
        setSnack({ open: true, severity: 'error', message: `Error: ${err.message}` });
      } finally {
        setLoading(false);
      }
    } else {
      setSnack({ open: true, severity: 'error', message: "Validation failed. Please check the form." });
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h5" className={classes.field}>
        Add User
      </Typography>
      <form noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={tc}
                  onChange={(e) => setTc(e.target.checked)}
                  color="primary"
                />
              }
              label="Terms and Conditions"
              className={classes.field}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  color="primary"
                />
              }
              label="Admin User"
              className={classes.field}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={
                passwordError &&
                "Password must be 8+ chars, not common, not all numeric, and not similar to your name"
              }
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              helperText={
                confirmPasswordError &&
                "Enter the same password as before, for verification."
              }
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl
              variant="outlined"
              fullWidth
              className={classes.field}
            >
              <InputLabel>Assign Sensors</InputLabel>
              <Select
                multiple
                value={selectedSensors}
                onChange={handleSensorChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {allSensors.map((sensor) => (
                  <MenuItem key={sensor.sensor_id} value={sensor.sensor_id}>
                    <Checkbox
                      checked={selectedSensors.includes(sensor.sensor_id)}
                    />
                    <ListItemText primary={`${sensor.name} (${sensor.sensor_id})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <CircularProgress className={classes.field} />
        ) : (
          <>
            <Button className={classes.btn} type="submit" variant="contained">
              Create User
            </Button>
            <Button
              className={classes.btn}
              variant="contained"
              onClick={clearForm}
            >
              Reset
            </Button>
          </>
        )}
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}