import { Container, Grid, IconButton, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { DeleteOutlined } from "@material-ui/icons";
import DownloadIcon from "@mui/icons-material/Download";
import SensorCardGraph from "./SensorCardGraph";
import { ExportData } from "./ExportData";

const useStyles = makeStyles({
  container: {
    // backgroundColor: "grey",
    margin: "10px 0px",
    padding: "10px",
    borderRadius: "3px",
    boxShadow:
      "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
    // borderLeft: "3px solid #2196f3",
  },
  title: {
    color: "#FFB400",
    textDecoration: "underline",
  },
  field: {
    marginBottom: 21,
    marginLeft: 21,
  },
  dataText: {
    fontSize: "1.65rem",
    fontWeight: 600,
  },
  delBtn: {
    fontSize: "20px",
    // margin: "6px",
    // cursor: "pointer"
  },
});

const SensorCard = ({ sensor, deleteSensor, userDetails }) => {
  const [liveData, setLiveData] = useState("-");
  const [liveTime, setLiveTime] = useState("-");
  const [liveDate, setLiveDate] = useState("-");

  useEffect(() => {
    if (sensor.live_sensors_set.length != 0) {
      setLiveTime(
        new Date(
          sensor.live_sensors_set[sensor.live_sensors_set.length - 1][
            "timestamp"
          ]
        ).toLocaleTimeString()
      );
      setLiveDate(
        new Date(
          sensor.live_sensors_set[sensor.live_sensors_set.length - 1][
            "timestamp"
          ]
        ).toDateString()
      );
      setLiveData(
        `${
          sensor.live_sensors_set[sensor.live_sensors_set.length - 1]["data"]
        }${sensor.unit}`
      );
    }
  }, [sensor]);

  const classes = useStyles();

  return (
    <React.Fragment>
      <Container className={classes.container}>
        <Typography
          style={{ fontSize: "1.2rem", fontWeight: 500, marginBottom: "-9px" }}
        >
          {sensor.name} Sensor
        </Typography>
        <hr style={{ border: "1px solid #FFB400", background: "#FFB400" }}></hr>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography color="textSecondary" style={{ fontSize: "0.75rem" }}>
              Id: {sensor.sensor_id}
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography color="textSecondary" style={{ fontSize: "0.75rem" }}>
              <i className="fa-regular fa-clock"></i>{" "}
              {`${liveTime} | ${liveDate}`}
            </Typography>
          </Grid>
        </Grid>
        <Typography className={classes.dataText}> {liveData}</Typography>
        {sensor.live_sensors_set && <SensorCardGraph sensor={sensor} />}
        <div style={{ display: "flex" }}>
          <IconButton>
            <DeleteOutlined
              className={classes.delBtn}
              onClick={() => deleteSensor(sensor.sensor_id)}
            />
          </IconButton>
          <ExportData sensorData={sensor} userDetails={userDetails} />
        </div>
      </Container>
    </React.Fragment>
  );
};

export default SensorCard;
