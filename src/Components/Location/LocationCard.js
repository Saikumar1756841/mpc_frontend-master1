import { Container, Grid, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import Navbar from "./Navbar";

const useStyles = makeStyles({
  container: {
    backgroundColor: "white",
    margin: "10px 0px",
    padding: "10px",
    borderRadius: "3px",
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

function getData(sensors_set) {
  let AvgData = [];
  let activeSensors = 0;
  const currDateTime = new Date();
  const cutOffTime = 15 * 1000; // 15 seconds in ms

  sensors_set.forEach((data) => {
    let temp = 0;
    let isActive = false;

    data?.live_sensors_set?.forEach((liveSensor) => {
      temp += parseInt(liveSensor.data);
      if (currDateTime - new Date(liveSensor.timestamp) <= cutOffTime) {
        isActive = true;
        activeSensors += 1;
      }
    });

    const average =
      temp !== 0 && data.live_sensors_set.length > 0
        ? temp / data.live_sensors_set.length
        : 0;

    AvgData.push({
      id: data.sensor_id,
      name: `Avg. ${data.name}`,
      unit: data.unit,
      value: average,
      isActive: isActive,
    });
  });

  return AvgData;
}

const LocationCard = ({ location, deleteSensor }) => {
  const classes = useStyles();
  const [avgData, setAvgData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    if (location?.sensors_set && Array.isArray(location.sensors_set)) {
      const data = getData(location.sensors_set);
      if (isMounted) {
        setAvgData(data);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [location]);

  return (
    <React.Fragment>
      <Container className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>Device Name: {location?.name || "N/A"}</Typography>
            <Typography>
              Total Sensors: {location?.sensors_set?.length || 0}
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography>Device ID: {location?.locId || "N/A"}</Typography>
            <Typography>User Name: {location?.userName || "N/A"}</Typography>
          </Grid>
        </Grid>

        <hr style={{ border: "1px solid #FFB400", background: "#FFB400" }} />

        <Grid container spacing={2}>
          {Array.isArray(location?.sensors_set) &&
            location.sensors_set.map((data) => {
              const obj = avgData.find((o) => o.id === data.sensor_id);
              return (
                <Grid key={data.id} item xs={4}>
                  <Navbar data={data} deleteSensor={deleteSensor} obj={obj} />
                </Grid>
              );
            })}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default LocationCard;
