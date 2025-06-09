import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts";
import { Paper, Title, Text, Group, Badge, Button, NumberInput } from "@mantine/core";
import { evaluate } from "mathjs";

const RootFindingChart = ({ 
  data, 
  equation, 
  method, 
  bounds, 
  currentIteration,     // Add this prop
  setCurrentIteration   // Add this prop
}) => {
  const [numPoints, setNumPoints] = useState(100);
  
  // Safe evaluation function
  const safeEval = (expr, x) => {
    try {
      return evaluate(expr, { x, e: Math.E });
    } catch {
      return NaN;
    }
  };
  
  // Generate chart data
  const generateChartData = (points = 200) => {
    const margin = Math.abs(bounds[1] - bounds[0]) * 0.3;
    const start = Math.min(...bounds) - margin;
    const end = Math.max(...bounds) + margin;
    const step = (end - start) / (points - 1);

    return Array.from({ length: points }, (_, i) => {
      const x = start + i * step;
      return {
        x: Number(x.toFixed(6)),
        y: safeEval(equation, x),
      };
    });
  };

  const chartData = generateChartData(numPoints);
  const total = chartData.length;
  const start = Math.floor(total * 0.1);
  const end = Math.ceil(total * 0.9);

  const [zoomDomain, setZoomDomain] = useState(null);
  // Remove this line: const [currentIteration, setCurrentIteration] = useState(data.length - 1);
  const [brushRange, setBrushRange] = useState([0, numPoints - 1]);

  const currentStep = data[currentIteration] || {};

  // Convergence data for second chart
  const convergenceData = data.map((item, index) => ({
    iteration: item.iteration,
    intervalWidth: Math.abs(item.b - item.a),
    error: Math.abs(item.fc),
    c: item.c,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`x = ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`f(x) = ${entry.value?.toFixed(6) || 'NaN'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ConvergenceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Iterasi: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.name.includes("Error") || entry.name.includes("Lebar")
                  ? entry.value.toExponential(3)
                  : entry.value.toFixed(6)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  React.useEffect(() => {
    setZoomDomain(null);
    setBrushRange([0, chartData.length - 1]);
    // Remove this line: setCurrentIteration(data.length - 1);
  }, [equation, bounds[0], bounds[1], numPoints]);

  const handleBrushChange = (e) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      const startX = chartData[e.startIndex]?.x;
      const endX = chartData[e.endIndex]?.x;
      setZoomDomain([startX, endX]);
      setBrushRange([e.startIndex, e.endIndex]);
    } else {
      setZoomDomain(null);
      setBrushRange([0, chartData.length - 1]);
    }
  };

  const methodNames = {
    bisection: "Biseksi",
    "regula-falsi": "Regula Falsi"
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>📈 Visualisasi Metode {methodNames[method]}</Title>
        <Badge variant="light" color="blue">
          Iterasi {currentIteration + 1} dari {data.length}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Grafik menunjukkan fungsi dan proses konvergensi interval menuju akar
      </Text>

      {/* Add NumberInput control here instead of inside LineChart */}
      <Group justify="space-between" mb="md">
        <NumberInput
          label="Jumlah Titik Grafik"
          value={numPoints}
          onChange={setNumPoints}
          min={5}
          max={500}
          step={1}
          w={200}
          size="sm"
          description="Kontrol resolusi grafik. Semakin kecil semakin cepat"
        />
      </Group>

      {/* Function Graph */}
      <div className="mb-6">
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Grafik Fungsi dan Interval</Text>
          <Group>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setZoomDomain(null);
                setBrushRange([0, chartData.length - 1]);
              }}
            >
              Reset Zoom
            </Button>
            <Group>
              <Button
                size="xs"
                variant="light"
                onClick={() => setCurrentIteration(Math.max(0, currentIteration - 1))}
                disabled={currentIteration === 0}
              >
                ← Prev
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={() => setCurrentIteration(Math.min(data.length - 1, currentIteration + 1))}
                disabled={currentIteration === data.length - 1}
              >
                Next →
              </Button>
            </Group>
          </Group>
        </Group>

        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={zoomDomain || ["dataMin", "dataMax"]}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Function line */}
              <Line
                type="monotone"
                dataKey="y"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="f(x)"
              />
              
              {/* Reference lines */}
              <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
              <ReferenceLine
                x={currentStep.a}
                stroke="#22c55e"
                strokeWidth={3}
                label={{ value: `a = ${currentStep.a?.toFixed(4)}`, position: "topLeft" }}
              />
              <ReferenceLine
                x={currentStep.b}
                stroke="#f59e0b"
                strokeWidth={3}
                label={{ value: `b = ${currentStep.b?.toFixed(4)}`, position: "topRight" }}
              />
              <ReferenceLine
                x={currentStep.c}
                stroke="#ef4444"
                strokeWidth={3}
                label={{ value: `c = ${currentStep.c?.toFixed(4)}`, position: "top" }}
              />
              
              <Brush
                dataKey="x"
                height={30}
                stroke="#2563eb"
                onChange={handleBrushChange}
                startIndex={brushRange[0]}
                endIndex={brushRange[1]}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rest of your component stays the same... */}
      {/* Convergence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Text fw={500} mb="xs">Konvergensi Lebar Interval</Text>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{ value: "Iterasi", position: "insideBottom", offset: -10 }}
                />
                <YAxis
                  scale="log"
                  domain={["dataMin", "dataMax"]}
                  label={{ value: "Lebar Interval (log)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<ConvergenceTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="intervalWidth"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  name="Lebar Interval"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <Text fw={500} mb="xs">Penurunan Error |f(c)|</Text>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{ value: "Iterasi", position: "insideBottom", offset: -10 }}
                />
                <YAxis
                  scale="log"
                  domain={["dataMin", "dataMax"]}
                  label={{ value: "Error (log)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<ConvergenceTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="error"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  name="Error |f(c)|"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          💡 Interpretasi Grafik:
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• <strong>Grafik atas:</strong> Fungsi f(x) dan interval [a,b]</li>
            <li>• <strong>Garis hijau/kuning:</strong> Batas interval a dan b</li>
            <li>• <strong>Garis merah:</strong> Perkiraan akar c</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>Grafik kiri bawah:</strong> Lebar interval mengecil</li>
            <li>• <strong>Grafik kanan bawah:</strong> Error |f(c)| mendekati 0</li>
            <li>• <strong>Skala logaritmik:</strong> Untuk melihat penurunan</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>Brush (brush bawah):</strong> Zoom ke area tertentu</li>
            <li>• <strong>Prev/Next:</strong> Lihat iterasi per langkah</li>
            <li>• <strong>Hover:</strong> Detail nilai di titik</li>
          </ul>
        </div>
      </div>

      {/* Current iteration info */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          📊 Status Iterasi {currentIteration + 1}:
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <Text size="xs" c="dimmed">Interval:</Text>
            <Text fw={500}>[{currentStep.a?.toFixed(6)}, {currentStep.b?.toFixed(6)}]</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Titik c:</Text>
            <Text fw={500}>{currentStep.c?.toFixed(8)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">f(c):</Text>
            <Text fw={500}>{currentStep.fc?.toExponential(3)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Lebar Interval:</Text>
            <Text fw={500}>{(Math.abs(currentStep.b - currentStep.a)).toExponential(3)}</Text>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default RootFindingChart;