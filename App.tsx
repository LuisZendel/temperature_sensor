import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import {
  Canvas,
  Line,
  Path,
  SkPath,
  useSVG,
  vec,
} from "@shopify/react-native-skia";
import { animatedData, DataPoint, originalData } from "./Data";
import { scaleLinear, line, curveBasis } from "d3";
import { scaleTime } from "d3";
import { Skia } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
interface GraphData {
  min: number;
  max: Number;
  curve: SkPath;
}

export default function App() {
  const [sensorData, setSensorData] = useState([{ valueSensing: 0 }, { valueSensing: 1 }]);
   
  useEffect(() => {
    fetch("http://192.168.100.203:3001/api/sensor/data")
      .then((res) => res.json())
      .then((data) => setSensorData(data));
  }, []);

  const GRAPH_HEIGHT = 400;
  const GRAPH_WIDTH = 370;

  const makeGraph = (data: DataPoint[]): GraphData => {
    const min = Math.min(...data.map((val) => val.value));
    const max = Math.max(...data.map((val) => val.value));

    const getYAxies = scaleLinear().domain([0, max]).range([GRAPH_HEIGHT, 35]);
    const getXAxies = scaleTime()
      .domain([new Date(2000, 1, 1), new Date(2000, 1, 15)])
      .range([10, GRAPH_WIDTH - 10]);

    const curvedline = line<DataPoint>()
      .x((d) => getXAxies(new Date(d.date)))
      .y((d) => getYAxies(d.value))
      .curve(curveBasis)(data);

    const skPath = Skia.Path.MakeFromSVGString(curvedline!);

    return {
      min,
      max,
      curve: skPath,
    };
  };

  const GraphData = makeGraph(animatedData);

  return (
    <View style={styles.container}>
      <Canvas
        style={{
          height: GRAPH_HEIGHT,
          width: GRAPH_WIDTH,
        }}
      >
        <Line
          strokeWidth={1}
          color="lightgrey"
          p1={vec(10, 130)}
          p2={vec(400, 130)}
        />
        <Line
          strokeWidth={1}
          color="lightgrey"
          p1={vec(10, 250)}
          p2={vec(400, 250)}
        />
        <Line
          strokeWidth={1}
          color="lightgrey"
          p1={vec(10, 370)}
          p2={vec(400, 370)}
        />
        <Path
          path={GraphData.curve}
          color="purple"
          strokeWidth={10}
          style="stroke"
        />
      </Canvas>
      <Text>{sensorData[0].valueSensing}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
