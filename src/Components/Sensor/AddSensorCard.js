import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Grid, makeStyles } from "@material-ui/core";
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
        // marginBottom: 21,
        margin: "auto",
        fontSize: "0.9rem",
    },
});

export default function AddSensorCard({ locationId }) {
    const classes = useStyles();
    const history = useHistory();

    const [name, setName] = useState([]);
    const [sensorId, setSensorId] = useState("");
    const [unit, setUnit] = useState("");

    const [nameError, setNameError] = useState(false);
    const [sensorIdError, setSensorIdError] = useState(false);
    const [unitError, setUnitError] = useState(false);

    const clearText = () => {
        setName("");
        setSensorId("");
        setUnit("");
        setNameError(false);
        setSensorIdError(false);
        setUnitError(false);
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        setNameError(false);
        setSensorIdError(false);

        if (name == "") {
            setNameError(true);
        }

        if (sensorId == "") {
            setSensorIdError(true);
        }

        if (unit == "") {
            setUnitError(true);
        }

        if (name && sensorId && unit) {
            const formData = {
                locationId: locationId,
                name: name,
                sensor_id: sensorId,
                unit: unit,
            };
            const settings = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            };
            const response = await fetch("http://localhost:8000/sensorDataAPI/", settings);
            if (response.status == 200) {
                alert("Sensor Added Succesfully!");
                clearText();
            } else {
                let data = await response.json();
                alert(data);
            }
        }
    }

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
                    Add Sensor Details
                </Typography>

                <form
                    action=""
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmitEvent}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
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
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                className={classes.field}
                                onChange={(e) => setSensorId(e.target.value)}
                                label="Sensor Id"
                                variant="outlined"
                                fullWidth
                                error={sensorIdError}
                                color="secondary"
                                value={sensorId}
                                required
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={2}>
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
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                className={classes.field}
                                type="submit"
                                variant="contained"
                                // disabled
                                size="small"
                                color="secondary"
                            >
                                Add Sensor
                            </Button>
                        </Grid>
                    </Grid>


                </form>
            </Container>
        </React.Fragment>
    );
}