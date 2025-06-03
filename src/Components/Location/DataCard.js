import { Container, Grid, IconButton, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  container: {
    backgroundColor: "white",
    margin: "10px 0px",
    padding: "10px",
    borderRadius: "3px",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    borderLeft: "2px solid #FFB400",
  },
  title: {
    color: "blue",
    textDecoration: "underline",
  },
  field: {
    marginBottom: 21,
  },
  dataText: {
    fontSize: "1.64rem",
    fontWeight: 600,
  },
  badge: {
    // padding: "0px 3px",
    borderRadius: "5px",
    textAlign: "center",
    margin: "auto",
  },
});

const DataCard = ({ data }) => {
  const classes = useStyles();
  const [gaugeValue, setGaugeValue] = useState(0);

  useEffect(() => {
    setGaugeValue(0.67);
    console.log(data.isActive);
  }, [data]);

  return (
    <React.Fragment>
      <Container className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Typography style={{ fontSize: "1.2rem" }}>{data.name} </Typography>
          </Grid>
          <Grid item xs={5}>
            <div
              className={classes.badge}
              style={{
                backgroundColor: data.isActive ? "#00e676" : "#ff1744",
                color: "black",
              }}
            >
              <Typography style={{ fontSize: "0.9rem" }}>
                {data.isActive ? "Active" : "Not Active"}
              </Typography>
            </div>
          </Grid>
          {/* <Grid item xs={2}>
                        
                    </Grid> */}
        </Grid>
        <Typography className={classes.dataText}>{`${data.value.toFixed(2)}${
          data.unit
        }`}</Typography>
      </Container>
    </React.Fragment>
  );
};

export default DataCard;
