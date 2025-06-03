import {
  Box,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { DeleteOutlined } from "@material-ui/icons";
import SensorCard from "../Sensor/SensorCard";
import DataCard from "./DataCard";

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
    fontSize: "1.34rem",
    fontWeight: 600,
  },
  badge: {
    // padding: "0px 3px",
    borderRadius: "5px",
    textAlign: "center",
    margin: "auto",
  },
});

const Navbar = ({ data, deleteSensor, obj }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {/* {console.log('data.name', data.name)} */}
        <Box>
          <Typography
            style={{marginRight: "3px"}}
            variant="overline"
            color="textSecondary"
          >{`${data.name}`}</Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={handleCheckboxChange}
                // color="orange"
              />
            }
          />
        </Box>
        {isChecked && (
          //<SensorCard sensor={data} deleteSensor={deleteSensor} />
          <div>
            <DataCard data={obj} />
            <SensorCard sensor={data} deleteSensor={deleteSensor} />
          </div>
        )}
      </Grid>
    </Grid>
  );
};
export default Navbar;
