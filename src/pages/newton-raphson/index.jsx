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
  Divider,
  Grid,
  Card,
  Badge,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Target } from "@phosphor-icons/react";
import { evaluate, derivative, parse } from "mathjs";
import Latex from "react-latex";
import FormulaExplanation from "../../components/FormulaExplanation";
import NewtonRaphsonIterationTable from "../../components/NewtonRaphsonIterationTable";
import NewtonRaphsonChart from "../../components/NewtonRaphsonChart";
import NewtonRaphsonVisualization from "../../components/NewtonRaphsonVisualization";

const NewtonRaphsonPage = () => {
  const [results, setResults] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [convergenceInfo, setConvergenceInfo] = useState(null);

  const form = useForm({
    initialValues: {
      equation: "x^3 - 2*x - 5",
      initialGuess: 2,
      tolerance: 0.0001,
      maxIterations: 20,
    },
    validate: {
      equation: (value) => {
        try {
          parse(value);
          return null;
        } catch {
          return "Persamaan tidak valid";
        }
      },
      tolerance: (value) =>
        value <= 0 ? "Toleransi harus lebih besar dari 0" : null,
      maxIterations: (value) =>
        value < 1 ? "Maksimal iterasi minimal 1" : null,
    },
  });

  const calculateNewtonRaphson = (values) => {
    setIsCalculating(true);
    setError("");
    try {
      const { equation, initialGuess, tolerance, maxIterations } = values;
      const expr = parse(equation);
      const derivativeExpr = derivative(expr, "x");
      const iterations = [];
      let x = parseFloat(initialGuess);
      let iter = 0;
      let converged = false;

      while (iter < maxIterations && !converged) {
        const fx = evaluate(equation, { x });
        const fpx = evaluate(derivativeExpr.toString(), { x });
        if (Math.abs(fpx) < 1e-12) {
          setError(
            "Turunan mendekati nol. Metode Newton-Raphson tidak dapat dilanjutkan."
          );
          setIsCalculating(false);
          return;
        }
        const xNext = x - fx / fpx;
        const err = Math.abs(xNext - x);
        iterations.push({
          iteration: iter + 1,
          x,
          fx,
          fpx,
          xNext,
          error: err,
        });
        if (err < tolerance) {
          converged = true;
          setConvergenceInfo({
            converged: true,
            finalValue: xNext,
            iterations: iter + 1,
            finalError: err,
          });
        }
        x = xNext;
        iter++;
      }

      if (!converged) {
        setConvergenceInfo({
          converged: false,
          finalValue: x,
          iterations: iter,
          finalError: iterations[iterations.length - 1]?.error || 0,
        });
      }

      setResults(iterations);
      setCurrentIteration(0);
    } catch (err) {
      setError("Terjadi kesalahan dalam perhitungan: " + err.message);
    }
    setIsCalculating(false);
  };

  const handleSubmit = (values) => calculateNewtonRaphson(values);

  const presetExamples = [
    { name: "x³ - 2x - 5 = 0", equation: "x^3 - 2*x - 5", guess: 2 },
    { name: "x² - 4 = 0", equation: "x^2 - 4", guess: 1 },
    { name: "cos(x) - x = 0", equation: "cos(x) - x", guess: 0.5 },
    { name: "e^x - 2x - 1 = 0", equation: "exp(x) - 2*x - 1", guess: 1 },
  ];

  const loadExample = (example) => {
    form.setValues({
      ...form.values,
      equation: example.equation,
      initialGuess: example.guess,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} align="center" mb="xl" color="blue">
        🧮 Pembelajaran Metode Newton-Raphson
      </Title>
      <Text align="center" size="lg" mb="xl" color="dimmed">
        Pelajari bagaimana metode Newton-Raphson bekerja secara visual dan
        interaktif
      </Text>

      <Grid>
        {/* Left pane: Input & Convergence Info */}
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
                description="Gunakan sintaks JS: ^, *, /, +, -, sin, cos, exp, log, dll."
              />
              <NumberInput
                label="Tebakan Awal (x₀)"
                placeholder="2"
                {...form.getInputProps("initialGuess")}
                mb="md"
                step={0.1}
              />
              <NumberInput
                label="Toleransi Error"
                placeholder="0.0001"
                {...form.getInputProps("tolerance")}
                mb="md"
                step={0.0001}
                decimalScale={6}
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
                Hitung Newton-Raphson
              </Button>
            </form>
            <Divider my="md" />
            <Text size="sm" fw={500} mb="xs">
              Contoh Persamaan:
            </Text>
            {presetExamples.map((ex, i) => (
              <Button
                key={i}
                variant="light"
                size="xs"
                mb="xs"
                fullWidth
                onClick={() => loadExample(ex)}
              >
                {ex.name}
              </Button>
            ))}
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
                Akar: <strong>{convergenceInfo.finalValue.toFixed(6)}</strong>
              </Text>
              <Text size="sm">
                Iterasi: <strong>{convergenceInfo.iterations}</strong>
              </Text>
              <Text size="sm">
                Error Akhir:{" "}
                <strong>{convergenceInfo.finalError.toExponential(3)}</strong>
              </Text>
            </Card>
          )}
        </Grid.Col>

        {/* Right pane: Explanation, steps, visualization, chart & table */}
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

          <FormulaExplanation equation={form.values.equation} />

          {/* Breakdown per iterasi */}
          {results.length > 0 && (
            <Card shadow="sm" radius="md" p="lg" withBorder mb="md">
              <Group position="apart" mb="md">
                <Title order={4}>
                  Langkah Iterasi {currentIteration + 1} dari {results.length}
                </Title>
                <Badge color="blue" variant="light">
                  Newton-Raphson
                </Badge>
              </Group>
              <Divider mb="md" />
              {(() => {
                const step = results[currentIteration];
                return (
                  <div>
                    <Text mb="xs">
                      <strong>Langkah 1.</strong> xₙ = {step.x.toFixed(6)}
                    </Text>
                    <Text mb="xs">
                      <strong>Langkah 2.</strong> f(xₙ) = {step.fx.toFixed(6)}
                    </Text>
                    <Text mb="xs">
                      <strong>Langkah 3.</strong> f&apos;(xₙ) ={" "}
                      {step.fpx.toFixed(6)}
                    </Text>
                    <Text mb="xs">
                      <strong>Langkah 4.</strong>{" "}
                      <Latex displayMode>
                        {`$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$`}
                      </Latex>
                    </Text>
                    <Text mb="xs" pl="md" ff="monospace">
                      xₙ₊₁ = {step.x.toFixed(6)} − {step.fx.toFixed(6)} ÷{" "}
                      {step.fpx.toFixed(6)} = {step.xNext.toFixed(6)}
                    </Text>
                    <Text mb="xs">
                      <strong>Langkah 5.</strong> Error = |xₙ₊₁ − xₙ| ={" "}
                      {step.error.toExponential(3)}
                    </Text>
                  </div>
                );
              })()}
              <Group position="apart" mt="lg">
                <Button
                  variant="default"
                  size="sm"
                  disabled={currentIteration === 0}
                  onClick={() => setCurrentIteration((i) => Math.max(0, i - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  disabled={currentIteration === results.length - 1}
                  onClick={() =>
                    setCurrentIteration((i) =>
                      Math.min(results.length - 1, i + 1)
                    )
                  }
                >
                  Selanjutnya
                </Button>
              </Group>
            </Card>
          )}

          {results.length > 0 && (
            <>
              <NewtonRaphsonVisualization
                data={results}
                equation={form.values.equation}
              />
              <NewtonRaphsonChart
                data={results}
                equation={form.values.equation}
              />
              <NewtonRaphsonIterationTable data={results} />
            </>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default NewtonRaphsonPage;
