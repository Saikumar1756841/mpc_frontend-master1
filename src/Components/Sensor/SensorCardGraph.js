import { Container, IconButton, Typography } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { makeStyles } from "@material-ui/core";
import { DeleteOutlined } from '@material-ui/icons';
import CanvasJSReact from "../CanvasJS/canvasjs.react"

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const useStyles = makeStyles({
    container: {
        backgroundColor: "white",
        
        padding: "10px",
        borderRadius: "3px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
        borderLeft: "3px solid #FFB400",
       
    },
    title: {
        color: "#FFB400",
        textDecoration: "underline",
    },
    field: {
        marginBottom: 21,
    },
    dataText: {
        fontSize: "1.7rem",
        fontWeight: 600,
    }
});

const SensorCardGraph = ({sensor}) => {

    const [dataPoints, setDataPoints] = useState([]);

    useEffect(() => {
        var lst = []
        var n = sensor.live_sensors_set.length;
        for(var i=n-1; i>=n-25 && i>=0; i--) {
            var data = sensor.live_sensors_set[i];
            var obj = {
                x: new Date(data.timestamp),
                y: parseFloat(data.data),
            }
            lst.push(obj);
        }
        setDataPoints(lst);
    }, [sensor])


    const options = {
        animationEnabled: true,
        axisY: {
            title: `${sensor.name} (in ${sensor.unit})`,
            prefix: ""
        },
        height: 160,
        data: [{
            yValueFormatString: `#,###${sensor.unit}`,
            xValueFormatString: "MMMM",
            type: "spline",
            dataPoints: dataPoints
        }]
    }
    return (
        <div style={{height: "160px"}}>
            {dataPoints && <CanvasJSChart options={options}/>}
        </div>
    )
}

export default SensorCardGraph