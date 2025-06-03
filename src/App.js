import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Chart } from 'chart.js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import { blue, purple } from "@material-ui/core/colors";
import Login from "./Components/Authentication/Login";
import Signup from "./Components/Authentication/Signup";
import { Box } from "@mui/material";
import Logs from "./pages/Logs";
import CreateSensor from "./pages/CreateSensor";
import CreateLocation from "./pages/CreateLocation";
import CreateUser from "./pages/CreateUser";
import UserInteraction from "./pages/UserInteraction";
import { Layout } from "./Components/Layout";
import './App.css';
import AllData from "./pages/AllData";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#FFB400",
    },
  },
  typography: {
    fontFamily: "Montserrat",
  },
});

function Dashboard({ userDetails }) {
  // Global variables for charts
  const chartsRef = useRef({});
  const [chartConfigs, setChartConfigs] = useState({
    'Temperature': { unit: '°C', color: 'rgba(255, 99, 132, 0.7)' },
    'Humidity': { unit: '%', color: 'rgba(54, 162, 235, 0.7)' },
    'Noise': { unit: 'dB', color: 'rgba(255, 206, 86, 0.7)' },
    'CO2': { unit: 'PPM', color: 'rgba(75, 192, 192, 0.7)' },
    'Light': { unit: 'Lux', color: 'rgba(153, 102, 255, 0.7)' },
    'Door': { unit: '', color: 'rgba(255, 159, 64, 0.7)' },
    'Window': { unit: '', color: 'rgba(199, 199, 199, 0.7)' },
    'Occupancy': { unit: '', color: 'rgba(83, 102, 255, 0.7)' },
    'Bed': { unit: '', color: 'rgba(40, 167, 69, 0.7)' },
    'Chair': { unit: '', color: 'rgba(220, 53, 69, 0.7)' },
    'Sofa 1': { unit: '', color: 'rgba(253, 126, 20, 0.7)' },
    'Sofa 2': { unit: '', color: 'rgba(23, 162, 184, 0.7)' }
  });

  // State variables for streaming data
  const [streamingData, setStreamingData] = useState({
    rows: [],
    currentIndex: 0,
    intervalId: null,
    headers: []
  });

  // Track unique rooms and selected rooms
  const [uniqueRooms, setUniqueRooms] = useState(new Set());
  const [selectedRooms, setSelectedRooms] = useState([]);

  // UI state
  const [connectionStatus, setConnectionStatus] = useState('Connected');
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isGraphsVisible, setIsGraphsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Filtering Data...');
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showRoomFilter, setShowRoomFilter] = useState(false);
  const [fullScreenGraph, setFullScreenGraph] = useState(null);
  const [userSensors, setUserSensors] = useState([]);

  // Column visibility state - initialize with all false
  const [visibleColumns, setVisibleColumns] = useState({
    Timestamp: true,
    Room: true
  });

  // Fetch user's assigned sensors on component mount
  useEffect(() => {
    if (userDetails && userDetails.id) {
      fetch(`/admin/sensor_app/sensor/?user__id=${userDetails.id}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem("token")).access}`
        }
      })
      .then(response => response.json())
      .then(data => {
        // Extract sensor types from the response
        const sensorTypes = data.map(sensor => sensor.sensor_type);
        
        // Create new visibleColumns state with only the user's sensors
        const newVisibleColumns = { Timestamp: true, Room: true };
        sensorTypes.forEach(type => {
          newVisibleColumns[type] = true;
        });
        
        setVisibleColumns(newVisibleColumns);
        
        // Also filter chartConfigs to only show user's sensors
        const filteredChartConfigs = {};
        Object.keys(chartConfigs).forEach(key => {
          if (sensorTypes.includes(key) || key === 'Timestamp' || key === 'Room') {
            filteredChartConfigs[key] = chartConfigs[key];
          }
        });
        
        setChartConfigs(filteredChartConfigs);
        setUserSensors(sensorTypes);
      })
      .catch(error => {
        console.error('Error fetching user sensors:', error);
      });
    }
  }, [userDetails]);

  // Initialize graphs
  useEffect(() => {
    initializeGraphs();
    return () => {
      // Clean up charts on unmount
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [userSensors]); // Re-initialize when userSensors changes

  const initializeGraphs = () => {
    // Only initialize charts for sensors the user has access to
    userSensors.forEach(metric => {
      const ctx = document.getElementById(`chart-${metric.toLowerCase().replace(' ', '-')}`);
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: `${metric} ${chartConfigs[metric]?.unit || ''}`,
              backgroundColor: chartConfigs[metric]?.color || 'rgba(0, 0, 0, 0.7)',
              borderColor: (chartConfigs[metric]?.color || 'rgba(0, 0, 0, 1)').replace('0.7', '1'),
              data: [],
              fill: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Time'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: `${metric} ${chartConfigs[metric]?.unit || ''}`
                }
              }
            }
          }
        });
        
        // Store chart reference
        chartsRef.current[metric] = chart;
        
        // Add click event to canvas for full screen
        ctx.onclick = () => {
          setFullScreenGraph(metric);
        };
      }
    });
  };

  // Filter functions
  const handleColumnFilterChange = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleColumnFilter = (event) => {
    event.stopPropagation();
    setShowColumnFilter(!showColumnFilter);
    setShowRoomFilter(false);
  };

  const toggleRoomFilter = (event) => {
    event.stopPropagation();
    setShowRoomFilter(!showRoomFilter);
    setShowColumnFilter(false);
  };

  const handleRoomSelectionChange = (room, isChecked) => {
    if (isChecked) {
      setSelectedRooms([...selectedRooms, room]);
    } else {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    }
  };

  const handleStartLogging = () => {
    setConnectionStatus('Connected');
  };

  const handleStopLogging = () => {
    setConnectionStatus('Disconnected');
    if (streamingData.intervalId) {
      clearInterval(streamingData.intervalId);
      setStreamingData(prev => ({ ...prev, intervalId: null }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      setLoadingMessage('Loading CSV...');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        prepareStreamingData(csvData);
        startDataStreaming();
        setIsGraphsVisible(true);
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const prepareStreamingData = (csvData) => {
    const rows = csvData.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    const rooms = new Set(dataRows.map(row => row[1]));
    setUniqueRooms(rooms);
    setSelectedRooms(Array.from(rooms));
    
    setStreamingData({
      rows: dataRows,
      currentIndex: 0,
      intervalId: null,
      headers: headers
    });

    // Initialize charts with data
    initializeChartsWithData(headers, dataRows);
  };

  const initializeChartsWithData = (headers, dataRows) => {
    userSensors.forEach(metric => {
      const metricIndex = headers.findIndex(h => h.includes(metric));
      if (metricIndex !== -1 && chartsRef.current[metric]) {
        const chart = chartsRef.current[metric];
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        
        // Add first 20 data points
        dataRows.slice(0, 20).forEach(row => {
          const value = parseFloat(row[metricIndex]) || 0;
          chart.data.labels.push(row[0]);
          chart.data.datasets[0].data.push(value);
        });
        
        chart.update();
      }
    });
  };

  const startDataStreaming = () => {
    if (streamingData.intervalId) {
      clearInterval(streamingData.intervalId);
    }
    
    const intervalId = setInterval(() => {
      setStreamingData(prev => {
        if (prev.currentIndex >= prev.rows.length) {
          clearInterval(prev.intervalId);
          return { ...prev, intervalId: null };
        }
        
        const newIndex = prev.currentIndex + 1;
        updateCharts(prev.rows[prev.currentIndex], prev.headers);
        return { ...prev, currentIndex: newIndex };
      });
    }, 1000);
    
    setStreamingData(prev => ({ ...prev, intervalId }));
  };

  const updateCharts = (row, headers) => {
    userSensors.forEach(metric => {
      const metricIndex = headers.findIndex(h => h.includes(metric));
      if (metricIndex !== -1 && chartsRef.current[metric]) {
        const value = parseFloat(row[metricIndex]) || 0;
        const chart = chartsRef.current[metric];
        
        if (chart.data.labels.length > 20) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }
        
        chart.data.labels.push(row[0]);
        chart.data.datasets[0].data.push(value);
        chart.update();
      }
    });
  };

  const handleDownloadCSV = () => {
    setIsLoading(true);
    setLoadingMessage('Generating CSV...');
    
    // Get selected columns (only those that exist in visibleColumns)
    const selectedColumns = Object.entries(visibleColumns)
      .filter(([column, isVisible]) => isVisible && (column === 'Timestamp' || column === 'Room' || userSensors.includes(column)))
      .map(([column]) => column);
    
    // Get selected rooms (or all if none selected)
    const roomsToInclude = selectedRooms.length > 0 ? selectedRooms : Array.from(uniqueRooms);
    
    // Generate CSV content
    const headers = ['Timestamp', ...selectedColumns.filter(col => col !== 'Timestamp')].join(',');
    const dataRows = streamingData.rows
      .filter(row => roomsToInclude.includes(row[1])) // Filter by room
      .map(row => {
        const filteredRow = [row[0]]; // Start with timestamp
        selectedColumns.forEach(col => {
          if (col !== 'Timestamp') {
            const colIndex = streamingData.headers.findIndex(h => h.includes(col));
            if (colIndex !== -1) {
              filteredRow.push(row[colIndex]);
            }
          }
        });
        return filteredRow.join(',');
      });
    
    const csvContent = [headers, ...dataRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'iot_data_filtered.csv');
    setIsLoading(false);
  };

  const handleDownloadGraphs = () => {
    const selectedGraphs = Array.from(document.querySelectorAll('#graphCheckboxes input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    if (selectedGraphs.length === 0) {
      alert('Please select at least one graph to download');
      return;
    }

    const zip = new JSZip();
    
    selectedGraphs.forEach((graphName) => {
      const chart = chartsRef.current[graphName];
      if (chart) {
        const canvas = chart.canvas;
        const imageData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
        zip.file(`${graphName}.png`, imageData, { base64: true });
      }
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'selected_graphs.zip');
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowColumnFilter(false);
        setShowRoomFilter(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Close full screen graph when clicking outside
  useEffect(() => {
    const handleClickOutsideGraph = (event) => {
      if (fullScreenGraph && !event.target.closest('.fullscreen-graph')) {
        setFullScreenGraph(null);
      }
    };

    if (fullScreenGraph) {
      document.addEventListener('click', handleClickOutsideGraph);
    }

    return () => {
      document.removeEventListener('click', handleClickOutsideGraph);
    };
  }, [fullScreenGraph]);

  return (
    <div className="App">
      <div className="container">
        <h1>IoT Data Logger</h1>
        <h2>Connection Status: <span id="connectionStatus" style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
          {connectionStatus}
        </span></h2>
        
        <div className="section">
          <div className="section-title">
            <h3>Data Controls</h3>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleStartLogging}><i className="fas fa-play"></i> Start Logging</button>
            <button onClick={handleStopLogging}><i className="fas fa-stop"></i> Stop Logging</button>
            <button onClick={handleDownloadCSV}><i className="fas fa-download"></i> Download CSV</button>
            <button onClick={() => document.getElementById('csvUpload').click()}><i className="fas fa-upload"></i> Upload CSV</button>
            <input 
              type="file" 
              id="csvUpload" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            
            <div className="dropdown" style={{ display: 'inline-block', marginLeft: '10px' }}>
              <button onClick={toggleRoomFilter}><i className="fas fa-door-open"></i> Select Room</button>
              <div className={`dropdown-content ${showRoomFilter ? 'show' : ''}`} style={{ width: '200px' }}>
                <div style={{ padding: '10px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Select Rooms</h4>
                  {Array.from(uniqueRooms).map(room => (
                    <label key={room} style={{ display: 'block', margin: '5px 0' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRooms.includes(room)}
                        onChange={(e) => handleRoomSelectionChange(room, e.target.checked)}
                      /> {room}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="dropdown" style={{ display: 'inline-block', marginLeft: '10px' }}>
              <button onClick={toggleColumnFilter}><i className="fas fa-filter"></i> Filter Columns</button>
              <div className={`dropdown-content ${showColumnFilter ? 'show' : ''}`} style={{ width: '200px' }}>
                <div style={{ padding: '10px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Filter Columns</h4>
                  {Object.entries(visibleColumns).map(([column, isVisible]) => (
                    <label key={column} style={{ display: 'block', margin: '5px 0' }}>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => handleColumnFilterChange(column)}
                      /> {column} {chartConfigs[column]?.unit ? `(${chartConfigs[column].unit})` : ''}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section" id="dataSection">
          <div className="section-title">
            <h3>Data Table</h3>
            <div>
              <label className="toggle-container">
                <span style={{ marginRight: '10px' }}>Show Table:</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isTableVisible}
                    onChange={() => setIsTableVisible(!isTableVisible)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </label>
              <button 
                className="section-toggle" 
                onClick={() => setIsTableVisible(!isTableVisible)}
              >
                <i className={`fas fa-eye${isTableVisible ? '-slash' : ''}`}></i> {isTableVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            {isTableVisible && (
              <div id="tableContent" style={{ display: 'block' }}>
                <table id="dataTable">
                  <thead>
                    <tr>
                      {visibleColumns.Timestamp && <th>Timestamp</th>}
                      {visibleColumns.Room && <th>Room</th>}
                      {userSensors.map(sensor => (
                        visibleColumns[sensor] && (
                          <th key={sensor}>
                            {sensor} {chartConfigs[sensor]?.unit ? `(${chartConfigs[sensor].unit})` : ''}
                          </th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {streamingData.rows
                      .filter(row => selectedRooms.length === 0 || selectedRooms.includes(row[1]))
                      .slice(0, 20)
                      .map((row, index) => (
                        <tr key={index}>
                          {visibleColumns.Timestamp && <td>{row[0]}</td>}
                          {visibleColumns.Room && <td>{row[1]}</td>}
                          {userSensors.map(sensor => (
                            visibleColumns[sensor] && (
                              <td key={sensor}>
                                {row[streamingData.headers.findIndex(h => h.includes(sensor))]}
                              </td>
                            )
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="section" id="graphSection">
          <div className="section-title">
            <h3>Data Visualization</h3>
            <div>
              <label className="toggle-container">
                <span style={{ marginRight: '10px' }}>Show Graphs:</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isGraphsVisible}
                    onChange={() => setIsGraphsVisible(!isGraphsVisible)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </label>
              <button 
                className="section-toggle" 
                onClick={() => setIsGraphsVisible(!isGraphsVisible)}
              >
                <i className={`fas fa-eye${isGraphsVisible ? '-slash' : ''}`}></i> {isGraphsVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {isGraphsVisible && (
            <div id="graphContent" style={{ display: 'block' }}>
              <div className="graph-container" id="graphContainer">
                {userSensors.map(metric => (
                  <div className="graph-wrapper" key={metric} data-metric={metric}>
                    <div className="graph-title">{metric} {chartConfigs[metric]?.unit || ''}</div>
                    <canvas 
                      id={`chart-${metric.toLowerCase().replace(' ', '-')}`}
                      style={{ width: '100%', height: '300px' }}
                    ></canvas>
                  </div>
                ))}
              </div>
              
              <div className="graph-download-controls">
                <div className="graph-checkboxes" id="graphCheckboxes">
                  {userSensors.map(metric => (
                    <label key={metric}>
                      <input type="checkbox" value={metric} defaultChecked />
                      {metric}
                    </label>
                  ))}
                </div>
                <button onClick={handleDownloadGraphs}><i className="fas fa-download"></i> Download Selected Graphs</button>
                <button onClick={() => {
                  document.querySelectorAll('#graphCheckboxes input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = true;
                  });
                }}><i className="fas fa-check-square"></i> Select All</button>
                <button onClick={() => {
                  document.querySelectorAll('#graphCheckboxes input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                  });
                }}><i className="fas fa-square"></i> Deselect All</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay" id="globalLoading">
          <div className="spinner"></div>
          <div style={{ color: '#5563DE', marginTop: '10px' }}>{loadingMessage}</div>
        </div>
      )}

      {fullScreenGraph && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-graph" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-header">
              <h2>{fullScreenGraph} {chartConfigs[fullScreenGraph]?.unit || ''}</h2>
              <button 
                className="close-button" 
                onClick={() => setFullScreenGraph(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="fullscreen-chart-container">
              <canvas 
                id={`fullscreen-chart-${fullScreenGraph.toLowerCase().replace(' ', '-')}`}
                ref={(el) => {
                  if (el && chartsRef.current[fullScreenGraph]) {
                    // Clone the chart data to the fullscreen canvas
                    const originalChart = chartsRef.current[fullScreenGraph];
                    const ctx = el.getContext('2d');
                    
                    // Destroy previous chart if exists
                    if (el.chart) {
                      el.chart.destroy();
                    }
                    
                    // Create new chart with same data
                    el.chart = new Chart(ctx, {
                      type: 'line',
                      data: JSON.parse(JSON.stringify(originalChart.data)),
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            display: true,
                            title: {
                              display: true,
                              text: 'Time'
                            }
                          },
                          y: {
                            display: true,
                            title: {
                              display: true,
                              text: `${fullScreenGraph} ${chartConfigs[fullScreenGraph]?.unit || ''}`
                            }
                          }
                        }
                      }
                    });
                  }
                }}
              ></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [userDetails, setUserDetails] = useState(null);
  const [token, setToken] = useState(null);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      fetch("/accounts/getUser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.code == "token_not_valid") {
            handleLogout();
          } else {
            setUserDetails(data);
            console.log(data, "HERE APPJS");
          }
          return data;
        });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route component={Login} path="/login" />
          <Route component={Signup} path="/signup" />
          <Layout>
            <Route exact path="/" component={AllData} />
            {userDetails && userDetails.is_staff ? (
              <Box>
                <Route component={Logs} exact path="/userLogs" />
                <Route exact path="/createSensor" component={CreateSensor} />
                <Route exact path="/createLocation" component={CreateLocation} />
                <Route exact path="/createUser" component={CreateUser} />
                <Route component={UserInteraction} exact path="/userInteractions" />
              </Box>
            ) : null}
            <Route exact path="/">
              <Dashboard userDetails={userDetails} />
            </Route>
          </Layout>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;