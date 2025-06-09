import React, { useState } from "react";
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Group,
  Alert,
  Text,
  Grid,
  Card,
  Badge,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Target } from "@phosphor-icons/react";
import { evaluate } from "mathjs";
import FormulaExplanation from "../../components/metode_secant/FormulaExplanation";
import IterationTable from "../../components/metode_secant/IterationTable";
import RootFindingChart from "../../components/metode_secant/RootFindingTable";

const MetodeSecantPage = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [convergenceInfo, setConvergenceInfo] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);

  const form = useForm({
    initialValues: {
      equation: "x^3 - 2*x - 5",
      x0: 2,
      x1: 3,
      tolerance: 0.000001,
      maxIterations: 20,
    },
    validate: {
      equation: (value) => {
        try {
          evaluate(value, { x: 1 });
          return null;
        } catch {
          return "Persamaan tidak valid";
        }
      },
      tolerance: (value) =>
        value <= 0 ? "Toleransi harus lebih besar dari 0" : null,
      maxIterations: (value) =>
        value < 1 ? "Maksimal iterasi minimal 1" : null,
      x0: (value, values) =>
        value === values.x1 ? "x₀ harus berbeda dengan x₁" : null,
    },
  });

  // Safe evaluation function
  const safeEval = (expr, x) => {
    try {
      return evaluate(expr, { x, e: Math.E });
    } catch {
      return NaN;
    }
  };

  // Secant method calculation
  const calculateSecantMethod = (values) => {
    setIsCalculating(true);
    setError("");

    try {
      const { equation, x0, x1, tolerance, maxIterations } = values;
      const steps = [];
      
      let xPrev = parseFloat(x0);
      let xCurr = parseFloat(x1);
      let fPrev = safeEval(equation, xPrev);
      let fCurr = safeEval(equation, xCurr);

      // Check if function values are valid
      if (isNaN(fPrev) || isNaN(fCurr)) {
        setError("Tidak dapat mengevaluasi fungsi pada titik awal!");
        setIsCalculating(false);
        return;
      }

      // Check if initial points are the same or have same function values
      if (Math.abs(xPrev - xCurr) < 1e-12) {
        setError("Titik awal x₀ dan x₁ harus berbeda!");
        setIsCalculating(false);
        return;
      }

      if (Math.abs(fPrev - fCurr) < 1e-12) {
        setError("f(x₀) dan f(x₁) tidak boleh sama (akan menyebabkan pembagian nol)!");
        setIsCalculating(false);
        return;
      }

      let converged = false;
      for (let i = 0; i < maxIterations && !converged; i++) {
        // Calculate slope (secant approximation)
        const slope = (fCurr - fPrev) / (xCurr - xPrev);
        
        // Calculate next point using secant formula
        const xNext = xCurr - (fCurr / slope);
        const fNext = safeEval(equation, xNext);
        
        // Calculate errors
        const error = Math.abs(xNext - xCurr);
        const relativeError = Math.abs(xNext) > 1e-12 ? (error / Math.abs(xNext)) * 100 : 0;

        steps.push({
          iteration: i + 1,
          xPrev: Number(xPrev.toFixed(8)),
          xCurr: Number(xCurr.toFixed(8)),
          xNext: Number(xNext.toFixed(8)),
          fPrev: Number(fPrev.toFixed(8)),
          fCurr: Number(fCurr.toFixed(8)),
          fNext: Number(fNext.toFixed(8)),
          slope: Number(slope.toFixed(8)),
          error: error,
          relativeError: relativeError,
        });

        // Check convergence
        if (Math.abs(fNext) < tolerance || error < tolerance) {
          converged = true;
          setConvergenceInfo({
            converged: true,
            finalValue: xNext,
            iterations: i + 1,
            finalError: Math.abs(fNext),
            finalAbsoluteError: error,
          });
        }

        // Update for next iteration
        xPrev = xCurr;
        xCurr = xNext;
        fPrev = fCurr;
        fCurr = fNext;

        // Check for invalid calculations
        if (isNaN(xNext) || isNaN(fNext)) {
          setError("Perhitungan menghasilkan nilai tidak valid. Coba ubah titik awal.");
          setIsCalculating(false);
          return;
        }
      }

      if (!converged) {
        setConvergenceInfo({
          converged: false,
          finalValue: steps[steps.length - 1]?.xNext || 0,
          iterations: steps.length,
          finalError: steps[steps.length - 1]?.fNext || 0,
          finalAbsoluteError: steps[steps.length - 1]?.error || 0,
        });
      }

      setResults(steps);
      setCurrentIteration(0);
    } catch (err) {
      setError("Terjadi kesalahan dalam perhitungan: " + err.message);
    }

    setIsCalculating(false);
  };

  const handleSubmit = (values) => {
    calculateSecantMethod(values);
  };

  const presetExamples = [
    { 
      name: "Fungsi Kubik", 
      equation: "x^3 - 2*x - 5", 
      x0: 2, 
      x1: 3,
      description: "Persamaan kubik klasik"
    },
    { 
      name: "Fungsi Kuadrat", 
      equation: "x^2 - 4*x + 3", 
      x0: 0, 
      x1: 1,
      description: "Persamaan kuadrat sederhana"
    },
    { 
      name: "Fungsi Eksponensial", 
      equation: "exp(x) - 3*x", 
      x0: 1, 
      x1: 2,
      description: "Persamaan eksponensial vs linear"
    },
    { 
      name: "Fungsi Trigonometri", 
      equation: "cos(x) - x", 
      x0: 0, 
      x1: 1,
      description: "Titik potong cos(x) dengan y = x"
    },
  ];

  const loadExample = (example) => {
    form.setValues({
      ...form.values,
      equation: example.equation,
      x0: example.x0,
      x1: example.x1,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="md" c="blue">
        🔄 Pembelajaran Metode Secant
      </Title>
      
      <Text ta="center" size="lg" mb="xl" c="dimmed">
        Pelajari Metode Secant untuk mencari akar persamaan tanpa turunan
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" radius="md">
            <Title order={3} mb="md">
              <Function size={24} style={{ marginRight: 8 }} />
              Input Parameter
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Persamaan f(x) = 0"
                placeholder="Contoh: x^3 - 2*x - 5"
                {...form.getInputProps("equation")}
                mb="md"
                description="Gunakan sintaks JavaScript (^, *, /, +, -, sin, cos, exp, log, dll)"
              />

              <Group grow mb="md">
                <NumberInput
                  label="Tebakan Awal x₀"
                  placeholder="2"
                  {...form.getInputProps("x0")}
                  step={0.1}
                />
                <NumberInput
                  label="Tebakan Awal x₁"
                  placeholder="3"
                  {...form.getInputProps("x1")}
                  step={0.1}
                />
              </Group>

              <NumberInput
                label="Toleransi Error"
                placeholder="0.000001"
                {...form.getInputProps("tolerance")}
                mb="md"
                step={0.000001}
                decimalScale={8}
              />

              <NumberInput
                label="Maksimal Iterasi"
                placeholder="20"
                {...form.getInputProps("maxIterations")}
                mb="md"
                min={1}
                max={100}
              />

              <Button
                type="submit"
                fullWidth
                loading={isCalculating}
                leftSection={<Target size={16} />}
              >
                Hitung Metode Secant
              </Button>
            </form>

            {/* Example Problems */}
            <Card mt="md" p="sm">
              <Text size="sm" fw={500} mb="xs">
                📚 Contoh Soal Latihan:
              </Text>
              {presetExamples.map((example, index) => (
                <Paper key={index} p="xs" mb="xs" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text size="xs" fw={500}>{example.name}</Text>
                      <Text size="xs" c="dimmed">{example.description}</Text>
                    </div>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => loadExample(example)}
                    >
                      Muat
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Card>
          </Paper>

          {convergenceInfo && (
            <Card mt="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Status Konvergensi</Text>
                <Badge
                  color={convergenceInfo.converged ? "green" : "orange"}
                  variant="light"
                >
                  {convergenceInfo.converged ? "Konvergen" : "Belum Konvergen"}
                </Badge>
              </Group>
              <Text size="sm">
                Akar: <strong>{convergenceInfo.finalValue.toFixed(8)}</strong>
              </Text>
              <Text size="sm">
                Iterasi: <strong>{convergenceInfo.iterations}</strong>
              </Text>
              <Text size="sm">
                |f(x)| Akhir: <strong>{convergenceInfo.finalError.toExponential(3)}</strong>
              </Text>
              <Text size="sm">
                Error Absolut: <strong>{convergenceInfo.finalAbsoluteError.toExponential(3)}</strong>
              </Text>
            </Card>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          {error && (
            <Alert
              icon={<Warning size={16} />}
              title="Error"
              color="red"
              mb="md"
            >
              {error}
            </Alert>
          )}

          <FormulaExplanation 
            equation={form.values.equation}
            results={results}
            currentIteration={currentIteration}
            setCurrentIteration={setCurrentIteration}
            tolerance={form.values.tolerance}
          />

          {results.length > 0 && (
            <>
              <RootFindingChart
                data={results}
                equation={form.values.equation}
                x0={form.values.x0}
                x1={form.values.x1}
                currentIteration={currentIteration}
                setCurrentIteration={setCurrentIteration}
              />
              <IterationTable data={results} />
            </>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MetodeSecantPage;