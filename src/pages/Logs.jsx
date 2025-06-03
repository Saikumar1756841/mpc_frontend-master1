  import React, { useEffect, useState } from "react";
  import Button from "@mui/material/Button";
  import Stack from "@mui/material/Stack";
  import SnackbarContent from "@mui/material/SnackbarContent";
  import { Container, Typography } from "@material-ui/core";
  import { makeStyles } from "@material-ui/core";

  const useStyles = makeStyles({
    field: {
      marginBottom: 10,
    },
  });

  const Logs = () => {
    const classes = useStyles();
    const [userLogs, setUserLogs] = useState([]);
    useEffect(async () => {
      const settings = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      const response = await fetch("api/getUserLogs/", settings);
      var data = await response.json();
      setUserLogs([...data]);
      console.log(data, "Here");
    }, []);

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
          User Logs
        </Typography>
        {userLogs ? userLogs.map((data, index) => (
          <Stack key={data.id} spacing={2}>
              <SnackbarContent style={{margin: "5px 0px"}} message={`${index+1}. ${data.userName} has ${data.data} on ${new Date(data.timestamp).toDateString()} at ${new Date(data.timestamp).toLocaleTimeString()}`} 
              action={data.isSeen ? null : "(New)" }/>
          </Stack>
        )): <Typography color="textSecondary">No User Logs Found!</Typography>}
      </Container>
    );
  };

  export default Logs;
