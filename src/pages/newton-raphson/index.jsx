import React, { useState, useEffect } from "react";
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

const NewtonRaphsonPage = () => {
  const [results, setResults] = useState([]);
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
      const iterations = [];
      let x = parseFloat(initialGuess);
      let iteration = 0;
      let converged = false;

      // Parse equation untuk mendapatkan turunan
      const expr = parse(equation);
      const derivativeExpr = derivative(expr, "x");

      while (iteration < maxIterations && !converged) {
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
        const error = Math.abs(xNext - x);

        iterations.push({
          iteration: iteration + 1,
          x: x,
          fx: fx,
          fpx: fpx,
          xNext: xNext,
          error: error,
        });

        if (error < tolerance) {
          converged = true;
          setConvergenceInfo({
            converged: true,
            finalValue: xNext,
            iterations: iteration + 1,
            finalError: error,
          });
        }

        x = xNext;
        iteration++;
      }

      if (!converged) {
        setConvergenceInfo({
          converged: false,
          finalValue: x,
          iterations: iteration,
          finalError: iterations[iterations.length - 1]?.error || 0,
        });
      }

      setResults(iterations);
    } catch (err) {
      setError("Terjadi kesalahan dalam perhitungan: " + err.message);
    }

    setIsCalculating(false);
  };

  const handleSubmit = (values) => {
    calculateNewtonRaphson(values);
  };

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
      <Title order={1} ta="center" mb="xl" c="blue">
        🧮 Pembelajaran Metode Newton-Raphson
      </Title>

      <Text ta="center" size="lg" mb="xl" c="dimmed">
        Pelajari bagaimana metode Newton-Raphson bekerja secara visual dan
        interaktif
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
            {presetExamples.map((example, index) => (
              <Button
                key={index}
                variant="light"
                size="xs"
                mb="xs"
                fullWidth
                onClick={() => loadExample(example)}
              >
                {example.name}
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

          {results.length > 0 && (
            <>
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
