// src/pages/HomePage.jsx
import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Text,
  Alert,
  Divider,
  Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Latex from "react-latex";
import IterationTable from "../../components/IterationTable";
import IterationChart from "../../components/IterationChart";
import { fixedPointIterationMethod } from "../../../utils/solvers"; // Only import fixedPoint
import { compile } from "mathjs"; // For evaluating g(x) for the chart

const initialFormValues = {
  gFnString: "(x+2)^(1/3)", // Example g(x) for x^3 - x - 2 = 0
  x0: 1.5,
  tolerance: 0.0001,
  maxIterations: 50,
};

const evaluateMathJs = (fnString, vars) => {
  try {
    const compiledFn = compile(fnString);
    const result = compiledFn.evaluate(vars);
    // Ensure result is a number and not excessively large/small for plotting
    if (typeof result === 'number' && isFinite(result) && Math.abs(result) < 1e8) {
        return result;
    }
    return null; // Return null for non-numeric, NaN, Infinity, or too large values
  } catch (e) {
    console.error("Error evaluating function with math.js:", e); // Optional: for debugging
    return null;
  }
};

let lastSolverOutput = {
  root: null,
  iterations: [],
  message: "",
  error: false,
};

export default function IterationPage() {
  const [iterations, setIterations] = useState([]);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const form = useForm({
    initialValues: initialFormValues,
    validate: {
      gFnString: (value) =>
        value.trim() === ""
          ? "g(x) function is required for Fixed-Point iteration"
          : null,
      x0: (value) =>
        value === undefined ? "Initial guess x0 is required" : null,
      tolerance: (value) =>
        value <= 0 ? "Tolerance must be positive" : null,
      maxIterations: (value) =>
        value <= 0 ? "Max iterations must be positive" : null,
    },
  });

  const generateChartData = (solverOutput, values) => {
    const newChartData = [];
    const numPlotPoints = 100;

    let relevantXs = [values.x0]; // Start with x0
    if (solverOutput.iterations) {
      solverOutput.iterations.forEach((iter) => {
        if (iter.xi !== undefined) relevantXs.push(iter.xi);
        if (iter.gxi !== undefined) relevantXs.push(iter.gxi); // g(xi) can also define range
      });
    }
    if (solverOutput.root !== null) {
      relevantXs.push(solverOutput.root);
    }

    relevantXs = relevantXs.filter(
      (val) => typeof val === "number" && !isNaN(val) && isFinite(val),
    );
    if (relevantXs.length === 0) relevantXs.push(0, 1); // Default if no valid points

    let minX = Math.min(...relevantXs);
    let maxX = Math.max(...relevantXs);

    if (minX === maxX) { // Handle case with single point
      minX -= 1;
      maxX += 1;
    }

    const range = maxX - minX;
    // Extend range, ensure it's not zero to avoid division by zero in step
    const padding = range === 0 ? 1 : range * 0.2;
    minX -= padding;
    maxX += padding;

    const step = (maxX - minX) / (numPlotPoints > 1 ? numPlotPoints - 1 : 1);

    // Generate points for g(x) and y=x curves
    for (let i = 0; i < numPlotPoints; i++) {
      const x = minX + i * step;
      const g_x_val = evaluateMathJs(values.gFnString, { x });
      newChartData.push({
        x,
        g_x: g_x_val, // Value of g(x)
        y_equals_x: x, // Value of y=x
      });
    }

    // Add iteration points (xi, g(xi))
    if (solverOutput.iterations) {
      solverOutput.iterations.forEach((iter, index) => {
        if (iter.xi !== undefined && iter.gxi !== undefined && iter.gxi !== null) {
          const iterX = iter.xi;
          const iterY = iter.gxi; // This is g(xi)
          const tooltipLabel = `(x_${index}, g(x_${index}))`;

          // Try to find an existing point to attach the iteration mark
          // This is less critical if iteration points are distinct from function plot points
          let existingPoint = newChartData.find(p => Math.abs(p.x - iterX) < step / 2);

          if (existingPoint) {
            existingPoint.iterationMark = iterY;
            existingPoint.tooltipLabel = tooltipLabel;
          } else {
            // Add as a new point if no close x-value exists
            // Also include g(x) and y=x values for this specific iteration x point
            const g_x_at_iterX = evaluateMathJs(values.gFnString, { x: iterX });
            newChartData.push({
              x: iterX,
              g_x: g_x_at_iterX,
              y_equals_x: iterX,
              iterationMark: iterY,
              tooltipLabel: tooltipLabel,
            });
          }
        }
      });
    }
    // Sort all data points by x before setting state for proper line rendering
    newChartData.sort((a, b) => a.x - b.x);
    setChartData(newChartData);
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setIterations([]);
    setResult(null);
    setMessage("");
    setChartData([]);

    let solverOutput = {
      root: null,
      iterations: [],
      message: "An error occurred.",
      error: true,
    };

    try {
      solverOutput = fixedPointIterationMethod(
        values.gFnString,
        parseFloat(values.x0), // Ensure x0 is a number
        values.tolerance,
        values.maxIterations,
      );
    } catch (e) {
      solverOutput = {
        root: null,
        iterations: [],
        message: `An unexpected error occurred: ${e.message}`,
        error: true,
      };
    }

    lastSolverOutput = solverOutput;

    setIterations(solverOutput.iterations);
    setResult(solverOutput.root);
    setMessage(solverOutput.message);

    if (!solverOutput.error && solverOutput.iterations.length > 0) {
      generateChartData(solverOutput, values);
    } else if (solverOutput.error) {
        setChartData([]); // Clear chart on error
    }


    setIsLoading(false);

    if (solverOutput.error) {
        alert(`‼️ ${solverOutput.message}`)
    //   notifications.show({
    //     title: "Solver Status",
    //     message: solverOutput.message,
    //     color: "red",
    //     icon: <IconAlertCircle />,
    //   });
    } else if (solverOutput.root !== null) {
        alert(`🪀 ${solverOutput.root.toFixed(7)}`)
    //   notifications.show({
    //     title: "Success",
    //     message: `Root found: ${solverOutput.root.toFixed(7)}`,
    //     color: "green",
    //     icon: <IconCheck />,
    //   });
    } else { // Max iterations reached without error, but no definitive root within tolerance
        alert(`🟡 ${solverOutput.message}`)

    //   notifications.show({
    //     title: "Notice",
    //     message: solverOutput.message,
    //     color: "yellow",
    //     icon: <IconAlertCircle />,
    //   });
    }
  };

  return (
    <Container fluid>
      <Paper shadow="xs" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <Title order={3} ta="center">
              Fixed-Point Iteration Settings
            </Title>

            <TextInput
              label={<Latex>{`Enter function \\(g(x)\\) for \\(x = g(x)\\)`}</Latex>}
              placeholder="e.g., (x+2)^(1/3) or cos(x)"
              {...form.getInputProps("gFnString")}
            />

            <NumberInput
              label={<Latex>{`Initial guess \\(x_0\\)`}</Latex>}
              placeholder="e.g., 1.5"
              {...form.getInputProps("x0")}
              step={0.1}
              allowDecimal
              precision={6} // Allow more precision for x0
            />

            <Group grow>
              <NumberInput
                label={<Latex>{`Tolerance (\\(\\epsilon\\))`}</Latex>}
                placeholder="e.g., 0.0001"
                {...form.getInputProps("tolerance")}
                step={0.00001} // Smaller step for tolerance
                min={1e-12} // Smaller min for tolerance
                max={1}
                decimalScale={12} // More decimal places
                precision={10}
                allowDecimal
              />
              <NumberInput
                label="Max Iterations"
                placeholder="e.g., 50"
                {...form.getInputProps("maxIterations")}
                min={1}
                max={500} 
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setIterations([]);
                  setResult(null);
                  setMessage("");
                  setChartData([]);
                  lastSolverOutput = { root: null, iterations: [], message: "", error: false };
                }}
              >
                Reset
              </Button>
              <Button type="submit" loading={isLoading}>
                Solve
              </Button>
            </Group>
          </Stack>
        </form>

        {message && (
          <Alert
            variant="light"
            color={lastSolverOutput.error ? "red" : (lastSolverOutput.root !== null ? "blue" : "orange")}
            title="Solver Status"
            // icon={<IconAlertCircle size="1rem" />}
            mt="lg"
          >
            {message}
          </Alert>
        )}

        {result !== null && (
          <Text mt="lg" fw={700} size="lg">
            <Latex>{`Calculated Root \\(x_{root}\\) ≈ ${result.toFixed(
              7,
            )}`}</Latex>
          </Text>
        )}

        {chartData.length > 0 && (
          <IterationChart
            data={chartData}
            // title is now default in IterationChart component
          />
        )}
         {chartData.length > 0 && (
          <Text size="sm" c="dimmed" ta="center" mt="xs">
            The root is found at the intersection of{" "}
            <Latex inline>{`$g(x)$`}</Latex> (blue) and{" "}
            <Latex inline>{`$y=x$`}</Latex> (green, dashed). Red dots show{" "}
            <Latex inline>{`$(x_i, g(x_i))$`}</Latex>.
          </Text>
        )}


        {iterations.length > 0 && (
          <>
            <Divider my="lg" label="Iteration Steps" labelPosition="center" />
            <IterationTable data={iterations} /> 
          </>
        )}
      </Paper>
    </Container>
  );
}
