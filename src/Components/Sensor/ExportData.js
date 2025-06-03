import React, { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { CSVLink } from "react-csv";
import { Box } from "@mui/system";
import { IconButton } from "@material-ui/core";
import DownloadIcon from '@mui/icons-material/Download';

export const ExportData = ({ sensorData }) => {
  // Create user log for downloading CSV
  function sendLogs(data) {
    const token = JSON.parse(localStorage.getItem("token"));
      fetch("/api/getUserLogs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
        body: JSON.stringify({
          data: data
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          // if (data.code == "token_not_valid") {
          //   // handleLogout();
          // } else {
          //   // setUserDetails(data);
          // }
          return data;
        });
  }


  // Export CSV-
  var date = new Date().toDateString();
  const createCsvFileName = () => `${sensorData.name}_${date}.csv`;
  const headers = [
    { label: "Data", key: "data" },
    { label: "Timestamp", key: "timestamp" },
  ];

  let data = [];
  sensorData.live_sensors_set &&
    sensorData.live_sensors_set.forEach((item) => {
      data.push({
        data: item.data,
        timestamp: item.timestamp,
      });
    });
  return (
    <React.Fragment>
      <Box>
        <CSVLink
          data={data}
          headers={headers}
          filename={createCsvFileName()}
          target="_blank"
          style={{ textDecoration: "none", outline: "none" }}
        >
          {/* <Button
            variant="contained"
            color="primary"
            style={{ height: "100%" }}
          >
            Download All Data
          </Button> */}
          <IconButton>
            <DownloadIcon
              style={{
                fontSize: "20px",
              }}
              onClick={() => sendLogs(`Downloaded Data of ${sensorData.name} Sensor`)}
            />
          </IconButton>
        </CSVLink>
      </Box>
    </React.Fragment>
  );
};
