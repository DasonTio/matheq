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

const RootFindingTable = ({ 
  data, 
  equation, 
  x0, 
  x1, 
  currentIteration,
  setCurrentIteration 
}) => {
  const [numPoints, setNumPoints] = useState(10);
  const [zoomDomain, setZoomDomain] = useState(null);

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
    if (!x0 || !x1) return [];
    
    const chartCenter = (x0 + x1) / 2;
    const chartRange = Math.max(2, Math.abs(x1 - x0) * 3);
    const start = chartCenter - chartRange;
    const end = chartCenter + chartRange;
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
  const [brushRange, setBrushRange] = useState([0, chartData.length - 1]);

  React.useEffect(() => {
    setZoomDomain(null);
    setBrushRange([0, chartData.length - 1]);
  }, [equation, x0, x1, numPoints]);

  const currentStep = data[currentIteration] || {};

  // Generate secant line data for visualization
  const generateSecantLineData = () => {
    if (!currentStep.xPrev || !currentStep.xCurr) return [];
    
    const slope = currentStep.slope;
    const x1 = currentStep.xCurr;
    const y1 = currentStep.fCurr;
    
    const intercept = y1 - slope * x1;
    
    const minX = Math.min(currentStep.xPrev, currentStep.xCurr) - 0.5;
    const maxX = Math.max(currentStep.xPrev, currentStep.xCurr) + 0.5;
    const step = (maxX - minX) / 50;
    
    return Array.from({ length: 51 }, (_, i) => {
      const x = minX + i * step;
      return {
        x: Number(x.toFixed(6)),
        y: slope * x + intercept,
      };
    });
  };

  const secantLineData = generateSecantLineData();

  // Convergence data for second chart
  const convergenceData = data.map((item) => ({
    iteration: item.iteration,
    error: Math.abs(item.error),
    fValue: Math.abs(item.fNext),
    xValue: item.xNext,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`x = ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(6) || 'NaN'}`}
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
              {`${entry.name}: ${entry.value.toExponential(3)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

  if (chartData.length === 0) {
    return (
      <Paper shadow="sm" p="md" radius="md" mb="md">
        <Title order={4}>📈 Visualisasi Metode Secant</Title>
        <Text c="dimmed" ta="center" mt="md">
          Masukkan parameter dan jalankan perhitungan untuk melihat grafik
        </Text>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>📈 Visualisasi Metode Secant</Title>
        <Badge variant="light" color="blue">
          Iterasi {currentIteration + 1} dari {data.length}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Grafik menunjukkan fungsi, garis secant, dan proses konvergensi
      </Text>

      {/* Number of points control */}
      <Group justify="space-between" mb="md">
        <NumberInput
          label="Jumlah Titik Grafik"
          value={numPoints}
          onChange={setNumPoints}
          min={50}
          max={500}
          step={10}
          w={200}
          size="sm"
          description="Kontrol resolusi grafik. Semakin kecil semakin cepat."
        />
      </Group>

      {/* Function Graph */}
      <div className="mb-6">
        <Group justify="space-between" mb="sm">
          <Text fw={500}>Grafik Fungsi dan Garis Secant</Text>
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
              
              {/* Secant line */}
              {secantLineData.length > 0 && (
                <Line
                  data={secantLineData}
                  type="monotone"
                  dataKey="y"
                  stroke="#ff7300"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Garis Secant"
                />
              )}
              
              {/* Reference lines */}
              <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
              {currentStep.xPrev && (
                <ReferenceLine
                  x={currentStep.xPrev}
                  stroke="#22c55e"
                  strokeWidth={3}
                  label={{ value: `x₍ₙ₋₁₎ = ${currentStep.xPrev?.toFixed(4)}`, position: "topLeft" }}
                />
              )}
              {currentStep.xCurr && (
                <ReferenceLine
                  x={currentStep.xCurr}
                  stroke="#f59e0b"
                  strokeWidth={3}
                  label={{ value: `xₙ = ${currentStep.xCurr?.toFixed(4)}`, position: "top" }}
                />
              )}
              {currentStep.xNext && (
                <ReferenceLine
                  x={currentStep.xNext}
                  stroke="#ef4444"
                  strokeWidth={3}
                  label={{ value: `x₍ₙ₊₁₎ = ${currentStep.xNext?.toFixed(4)}`, position: "topRight" }}
                />
              )}
              
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

      {/* Convergence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Text fw={500} mb="xs">Konvergensi Error Absolut</Text>
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
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  name="Error |xₙ₊₁ - xₙ|"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <Text fw={500} mb="xs">Penurunan |f(x)|</Text>
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
                  label={{ value: "|f(x)| (log)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<ConvergenceTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fValue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  name="Nilai |f(x)|"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Current iteration info */}
      {currentStep.xNext && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <Text size="sm" fw={500} mb="xs">
            📊 Status Iterasi {currentIteration + 1}:
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <Text size="xs" c="dimmed">x₍ₙ₋₁₎:</Text>
              <Text fw={500}>{currentStep.xPrev?.toFixed(6)}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">xₙ:</Text>
              <Text fw={500}>{currentStep.xCurr?.toFixed(6)}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">x₍ₙ₊₁₎:</Text>
              <Text fw={500}>{currentStep.xNext?.toFixed(8)}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Gradien Secant:</Text>
              <Text fw={500}>{currentStep.slope?.toExponential(3)}</Text>
            </div>
          </div>
        </div>
      )}
    </Paper>
  );
};

export default RootFindingTable;