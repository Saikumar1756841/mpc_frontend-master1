import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useState, useEffect } from "react";

// Footer Copyright
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Sensor as a Service
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);

  // Check if token exists on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("Checking stored token on mount:", storedToken);
    if (storedToken) {
      try {
        setToken(JSON.parse(storedToken));
      } catch (err) {
        console.error("Invalid token in localStorage:", storedToken);
        localStorage.removeItem("token"); // clean up bad value
      }
    }
  }, []);

  // Redirect if token is available
  useEffect(() => {
    console.log("Token in useEffect:", token);
    if (token) {
      console.log("Redirecting to home because token is present...");
      window.location.href = "/";
    }
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    console.log("BASE_URL from env:", BASE_URL);
    console.log("Submitting login with email:", email);

    fetch(`${BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type");
        console.log("Response content-type:", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON, got: ${text}`);
        }

        const data = await response.json();
        console.log("Login response data:", data);

        if (data.errors && data.errors.non_field_errors) {
          alert("Email or Password is not valid");
          return;
        }

        if (!data.token) {
          alert("Login failed: No token received.");
          return;
        }

        console.log("Storing token and setting state...");
        localStorage.setItem("token", JSON.stringify(data.token));
        setToken(data.token);
      })
      .catch((error) => {
        console.error("Login error:", error.message);
        alert("Something went wrong. Try again.");
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>
          <Grid container>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
