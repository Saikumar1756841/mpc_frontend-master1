import React, { useState, useEffect, useRef } from "react";
import Typography from "@material-ui/core/Typography";
import { Box, makeStyles } from "@material-ui/core";
import LocationCard from "../Components/Location/LocationCard";

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

export default function AllData() {
  const classes = useStyles();
  const [locationData, setLocationData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  // Refs to track last fetched data and count of fetches without data change
  const lastDataRef = useRef(null);
  const fetchCountRef = useRef(0);

  // Function to delete sensor
  const deleteSensor = async (sensor_id) => {
    if (!window.confirm("Are you sure want to delete?")) {
      return;
    }
    const formData = { sensor_id };
    const settings = {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch("api/sensorDataAPI/", settings);
      const data = await response.json();
      setLocationData([...data]);
    } catch (error) {
      console.error("Error deleting sensor:", error);
    }
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return token !== null;
  };

  // Logout user
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Fetch user details once on mount
  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    const token = JSON.parse(localStorage.getItem("token"));
    fetch("/accounts/getUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access}`,
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.code === "token_not_valid") {
          handleLogout();
        } else {
          setUserDetails(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user details:", error);
        handleLogout();
      });
  }, []);

  // Function to fetch location data with update check
  const getData = async (token) => {
    try {
      const settings = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
      };

      const response = await fetch("api/locationDataAPI/", settings);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data has changed compared to last fetch
      if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        setLocationData(data);
        lastDataRef.current = data;
        fetchCountRef.current = 0; // reset fetch count if data changed
        console.log("Location data updated");
      } else {
        // Increment fetch count if data unchanged
        fetchCountRef.current += 1;
        console.log("No change in location data, skipping state update");

        // Optional: stop fetching after certain tries with no change
        if (fetchCountRef.current >= 6) { // e.g., after 30 seconds (6 * 5 sec)
          console.log("Stopping repeated fetches due to no data changes.");
          return false; // indicate to stop fetching
        }
      }
    } catch (error) {
      console.error("Failed to fetch location data:", error);
    }

    return true; // continue fetching
  };

  // Effect to fetch data on interval, with stopping condition
  useEffect(() => {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) {
    handleLogout();
    return;
  }

  // Just call it once
  getData(token);
}, []);

  return (
    <Box>
      {locationData.length === 0 ? (
        <Typography
          variant="h5"
          align="left"
          component="h5"
          gutterBottom
          color="textSecondary"
        >
          Currently No Device Is Added!
        </Typography>
      ) : (
        <Typography
          variant="h5"
          align="left"
          component="h5"
          gutterBottom
          color="textSecondary"
        >
          Devices Data
        </Typography>
      )}

      {locationData &&
        locationData.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            deleteSensor={deleteSensor}
            userDetails={userDetails}
          />
        ))}
    </Box>
  );
}
