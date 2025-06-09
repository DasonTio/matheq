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
  Tabs,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Target } from "@phosphor-icons/react";
import { evaluate } from "mathjs";
import FormulaExplanation from "../../components/metode_tertutup/FormulaExplanation";
import IterationTable from "../../components/metode_tertutup/IterationTable";
import RootFindingChart from "../../components/metode_tertutup/RootFindingChart";

const MetodeTertutupPage = () => {
  const [method, setMethod] = useState("bisection");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [convergenceInfo, setConvergenceInfo] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0); // Add this for step navigation

  const form = useForm({
    initialValues: {
      equation: "-0.9*x^2 + 1.7*x + 2.5",
      lowerBound: 2.8,
      upperBound: 3,
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
      lowerBound: (value, values) =>
        value >= values.upperBound ? "Batas bawah harus < batas atas" : null,
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

  // Root finding calculation
  const calculateRootFinding = (values) => {
    setIsCalculating(true);
    setError("");

    try {
      const { equation, lowerBound, upperBound, tolerance, maxIterations } = values;
      const steps = [];
      let a = parseFloat(lowerBound);
      let b = parseFloat(upperBound);
      let fa = safeEval(equation, a);
      let fb = safeEval(equation, b);

      // Check if f(a) * f(b) < 0
      if (isNaN(fa) || isNaN(fb) || fa * fb > 0) {
        setError("f(a) × f(b) harus < 0 untuk metode ini! Tidak ada akar dalam interval.");
        setIsCalculating(false);
        return;
      }

      let converged = false;
      for (let i = 0; i < maxIterations && !converged; i++) {
        let c;
        
        // Calculate c based on method
        if (method === "bisection") {
          c = (a + b) / 2;
        } else { // regula-falsi
          c = (a * fb - b * fa) / (fb - fa);
        }
        
        const fc = safeEval(equation, c);
        const errorAbs = Math.abs(fc);

        steps.push({
          iteration: i + 1,
          a: Number(a.toFixed(8)),
          b: Number(b.toFixed(8)),
          c: Number(c.toFixed(8)),
          fa: Number(fa.toFixed(8)),
          fb: Number(fb.toFixed(8)),
          fc: Number(fc.toFixed(8)),
          error: errorAbs,
          interval: [a, b],
          chosen: fa * fc < 0 ? "left" : "right",
          method: method,
        });

        if (errorAbs < tolerance || Math.abs(b - a) < tolerance) {
          converged = true;
          setConvergenceInfo({
            converged: true,
            finalValue: c,
            iterations: i + 1,
            finalError: errorAbs,
          });
        }

        // Update interval
        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }
      }

      if (!converged) {
        setConvergenceInfo({
          converged: false,
          finalValue: steps[steps.length - 1]?.c || 0,
          iterations: steps.length,
          finalError: steps[steps.length - 1]?.error || 0,
        });
      }

      setResults(steps);
      setCurrentIteration(0); // Reset to first iteration when new calculation
    } catch (err) {
      setError("Terjadi kesalahan dalam perhitungan: " + err.message);
    }

    setIsCalculating(false);
  };

  const handleSubmit = (values) => {
    calculateRootFinding(values);
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setResults([]);
    setConvergenceInfo(null);
    setError("");
    setCurrentIteration(0);
  };

  const presetExamples = [
    { 
      name: "Fungsi Kuadrat", 
      equation: "-0.9*x^2 + 1.7*x + 2.5", 
      lower: 2.8, 
      upper: 3,
      description: "Persamaan kuadrat dengan akar di sekitar 2.9"
    },
    { 
      name: "Fungsi Kubik", 
      equation: "x^3 - 2*x - 5", 
      lower: 2, 
      upper: 3,
      description: "Persamaan kubik klasik"
    },
    { 
      name: "Fungsi Eksponensial", 
      equation: "exp(x) - 3*x", 
      lower: 1, 
      upper: 2,
      description: "Persamaan eksponensial vs linear"
    },
    { 
      name: "Fungsi Trigonometri", 
      equation: "cos(x) - x", 
      lower: 0, 
      upper: 1,
      description: "Titik potong cos(x) dengan y = x"
    },
  ];

  const loadExample = (example) => {
    form.setValues({
      ...form.values,
      equation: example.equation,
      lowerBound: example.lower,
      upperBound: example.upper,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="md" c="blue">
        📐 Pembelajaran Metode Tertutup
      </Title>
      
      <Text ta="center" size="lg" mb="xl" c="dimmed">
        Pelajari Metode Biseksi dan Regula Falsi untuk mencari akar persamaan
      </Text>

      {/* Method Selection */}
      <Paper shadow="sm" p="md" radius="md" mb="xl">
        <Tabs value={method} onChange={handleMethodChange}>
          <Tabs.List position="center">
            <Tabs.Tab value="bisection">
              🔄 Metode Biseksi
            </Tabs.Tab>
            <Tabs.Tab value="regula-falsi">
              📏 Metode Regula Falsi
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>

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
                placeholder="Contoh: -0.9*x^2 + 1.7*x + 2.5"
                {...form.getInputProps("equation")}
                mb="md"
                description="Gunakan sintaks JavaScript (^, *, /, +, -, sin, cos, exp, log, dll)"
              />

              <Group grow mb="md">
                <NumberInput
                  label="Batas Bawah (a)"
                  placeholder="2.8"
                  {...form.getInputProps("lowerBound")}
                  step={0.1}
                />
                <NumberInput
                  label="Batas Atas (b)"
                  placeholder="3"
                  {...form.getInputProps("upperBound")}
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
                Hitung {method === "bisection" ? "Biseksi" : "Regula Falsi"}
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
                Error Akhir: <strong>{convergenceInfo.finalError.toExponential(3)}</strong>
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
            method={method} 
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
                method={method}
                bounds={[form.values.lowerBound, form.values.upperBound]}
                currentIteration={currentIteration}        // Add this
                setCurrentIteration={setCurrentIteration}  // Add this
              />
              <IterationTable data={results} method={method} />
            </>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MetodeTertutupPage;