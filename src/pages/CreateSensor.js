import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Grid, makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";

function generateUUID() {
  return "SEN" + ((Math.random() * Math.pow(36, 5)) | 0).toString(36);
}

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

export default function CreateSensor() {
  const classes = useStyles();

  const [name, setName] = useState("");
  const [sensorId, setSensorId] = useState(generateUUID());
  const [unit, setUnit] = useState("");
  const [locationID, setLocationID] = useState("");

  const [nameError, setNameError] = useState(false);
  const [sensorIdError, setSensorIdError] = useState(false);
  const [unitError, setUnitError] = useState(false);
  const [locationIDError, setLocationIDError] = useState(false);

  const clearText = () => {
    setName("");
    setSensorId(generateUUID());
    setUnit("");
    setLocationID("");

    setNameError(false);
    setSensorIdError(false);
    setUnitError(false);
    setLocationIDError(false);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    setNameError(false);
    setSensorIdError(false);
    setUnitError(false);
    setLocationIDError(false);

    let hasError = false;

    if (name.trim() === "") {
      setNameError(true);
      hasError = true;
    }

    if (sensorId.trim() === "") {
      setSensorIdError(true);
      hasError = true;
    }

    if (unit.trim() === "") {
      setUnitError(true);
      hasError = true;
    }

    if (locationID === "" || isNaN(locationID)) {
      setLocationIDError(true);
      hasError = true;
    }

    if (hasError) return;

    const formData = {
      name: name.trim(),
      sensor_id: sensorId.trim(),
      unit: unit.trim(),
      location: Number(locationID),
    };

    const token = localStorage.getItem("token");
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;

    try {
      const response = await fetch(`${BASE_URL}/api/sensorDataAPI/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Success: " + JSON.stringify(data));
        clearText();
      } else {
        const errData = await response.json();
        alert("Error: " + JSON.stringify(errData));
      }
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };

  return (
    <Container>
      <Typography
        className={classes.field}
        variant="h5"
        align="left"
        component="h5"
        gutterBottom
        color="textSecondary"
      >
        Create a New Sensor
      </Typography>

      <form noValidate autoComplete="off" onSubmit={handleSubmitEvent}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              onChange={(e) => setName(e.target.value)}
              label="Sensor Name"
              variant="outlined"
              fullWidth
              error={nameError}
              color="secondary"
              value={name}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              onChange={(e) => setLocationID(e.target.value)}
              label="Device ID"
              variant="outlined"
              fullWidth
              error={locationIDError}
              color="secondary"
              value={locationID}
              required
              type="number"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              label="Sensor Id"
              variant="outlined"
              fullWidth
              error={sensorIdError}
              color="secondary"
              value={sensorId}
              required
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              className={classes.field}
              onChange={(e) => setUnit(e.target.value)}
              label="Sensor Unit"
              variant="outlined"
              fullWidth
              error={unitError}
              color="secondary"
              value={unit}
              required
            />
          </Grid>
        </Grid>

        <Button
          className={classes.field}
          type="submit"
          variant="contained"
          color="secondary"
        >
          Add Sensor
        </Button>
        <Button
          className={classes.field}
          onClick={clearText}
          variant="contained"
          color="secondary"
        >
          Reset Default
        </Button>
      </form>
    </Container>
  );
}
