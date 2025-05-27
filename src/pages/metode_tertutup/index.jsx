import React, { useState } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stepper,
  Text,
  Center,
  Stack,
  Box,
  Divider,
} from "@mantine/core";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

// Parse math expression like "-0.9x^2 + 1.7x + 2.5"
function parseMathExpr(expr) {
  // Replace ^ with ** for JS eval
  return expr.replace(/(\d*\.?\d*)x\^(\d+)/g, (m, coef, pow) =>
    `${coef === "" ? 1 : coef}*x**${pow}`
  ).replace(/x/g, "*x").replace(/\*\*/g, "^").replace(/\*x\^/g, "x^").replace(/\^/g, "**").replace(/\*\*/g, "**").replace(/\*x/g, "x").replace(/([0-9])x/g, "$1*x");
}

function safeEval(expr, x) {
  try {
    // eslint-disable-next-line no-new-func
    return Function("x", `return ${expr}`)(x);
  } catch {
    return NaN;
  }
}

function generateChartData(expr, a, b, points = 100) {
  const step = (b - a) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const x = a + i * step;
    return { x, y: safeEval(expr, x) };
  });
}

function bisectionSteps(expr, a, b, tol = 1e-6, maxSteps = 20) {
  const steps = [];
  let fa = safeEval(expr, a);
  let fb = safeEval(expr, b);

  if (isNaN(fa) || isNaN(fb) || fa * fb > 0) return [];

  for (let i = 0; i < maxSteps; i++) {
    const c = (a + b) / 2;
    const fc = safeEval(expr, c);

    steps.push({
      step: i + 1,
      a,
      b,
      c,
      fa,
      fb,
      fc,
      interval: [a, b],
      chosen: fa * fc < 0 ? "left" : "right",
    });

    if (Math.abs(fc) < tol || Math.abs(b - a) < tol) break;

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }
  return steps;
}

const defaultExpr = "-0.9x^2 + 1.7x + 2.5";

export default function MetodeTertutup() {
  const [expr, setExpr] = useState(defaultExpr);
  const [a, setA] = useState(2.8);
  const [b, setB] = useState(3.0);
  const [tol, setTol] = useState(1e-6);
  const [maxSteps, setMaxSteps] = useState(10);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);

  const parsedExpr = parseMathExpr(expr);

  const handleSubmit = (e) => {
    e.preventDefault();
    const s = bisectionSteps(parsedExpr, Number(a), Number(b), Number(tol), Number(maxSteps));
    setSteps(s);
    setCurrentStep(0);
    setActiveSubStep(0);
  };

  const step = steps[currentStep] || {};

  // For chart zoom: show a little more than [a, b] at each step
  const chartMargin = (step.b - step.a) * 0.2 || 1;
  const chartA = (step.a ?? a) - chartMargin;
  const chartB = (step.b ?? b) + chartMargin;
  const chartData = generateChartData(parsedExpr, chartA, chartB);

  // Substeps: 0 = f(a), 1 = f(b), 2 = c, 3 = f(c)
  const subSteps = [
    {
      label: "Substitusi a ke f(x)",
      content: (
        <Stack spacing={4}>
          <Text>
            <b>f(x) = {expr}</b>
          </Text>
          <Text>
            <b>a = {step.a}</b>
          </Text>
          <Text>
            <b>
              f(a) = {expr.replace(/x/g, `(${step.a})`)} = {step.fa}
            </b>
          </Text>
        </Stack>
      ),
    },
    {
      label: "Substitusi b ke f(x)",
      content: (
        <Stack spacing={4}>
          <Text>
            <b>f(x) = {expr}</b>
          </Text>
          <Text>
            <b>b = {step.b}</b>
          </Text>
          <Text>
            <b>
              f(b) = {expr.replace(/x/g, `(${step.b})`)} = {step.fb}
            </b>
          </Text>
        </Stack>
      ),
    },
    {
      label: "Hitung titik tengah c",
      content: (
        <Stack spacing={4}>
          <Text>
            <b>c = (a + b) / 2 = ({step.a} + {step.b}) / 2 = {step.c}</b>
          </Text>
        </Stack>
      ),
    },
    {
      label: "Substitusi c ke f(x)",
      content: (
        <Stack spacing={4}>
          <Text>
            <b>f(x) = {expr}</b>
          </Text>
          <Text>
            <b>c = {step.c}</b>
          </Text>
          <Text>
            <b>
              f(c) = {expr.replace(/x/g, `(${step.c})`)} = {step.fc}
            </b>
          </Text>
        </Stack>
      ),
    },
  ];

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Title align="center" order={2} mb="md">
          Metode Biseksi (Bisection Method)
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Fungsi f(x)"
              description="Contoh: -0.9x^2 + 1.7x + 2.5"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              required
            />
            <Group grow>
              <NumberInput
                label="Batas bawah (a)"
                value={a}
                onChange={setA}
                precision={4}
                required
              />
              <NumberInput
                label="Batas atas (b)"
                value={b}
                onChange={setB}
                precision={4}
                required
              />
            </Group>
            <Group grow>
              <NumberInput
                label="Toleransi"
                value={tol}
                onChange={setTol}
                precision={8}
                required
              />
              <NumberInput
                label="Maksimal Langkah"
                value={maxSteps}
                onChange={setMaxSteps}
                required
              />
            </Group>
            <Button type="submit" fullWidth>
              Mulai
            </Button>
          </Stack>
        </form>

        {steps.length > 0 && (
          <Box mt="xl">
            <Stepper
              active={activeSubStep}
              onStepClick={setActiveSubStep}
              breakpoint="sm"
              orientation="vertical"
            >
              {subSteps.map((sub, idx) => (
                <Stepper.Step key={sub.label} label={sub.label}>
                  <Box
                    sx={{
                      background: "#f8fafc",
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 8,
                    }}
                  >
                    {sub.content}
                  </Box>
                </Stepper.Step>
              ))}
            </Stepper>

            <Group position="center" mt="md">
              <Button
                variant="default"
                onClick={() => {
                  if (activeSubStep > 0) setActiveSubStep((s) => s - 1);
                  else if (currentStep > 0) {
                    setCurrentStep((s) => s - 1);
                    setActiveSubStep(3);
                  }
                }}
                disabled={currentStep === 0 && activeSubStep === 0}
              >
                Sebelumnya
              </Button>
              <Button
                onClick={() => {
                  if (activeSubStep < 3) setActiveSubStep((s) => s + 1);
                  else if (currentStep < steps.length - 1) {
                    setCurrentStep((s) => s + 1);
                    setActiveSubStep(0);
                  }
                }}
                disabled={
                  currentStep === steps.length - 1 && activeSubStep === 3
                }
              >
                Selanjutnya
              </Button>
            </Group>

            <Divider my="lg" />

            <Title order={4} align="center" mb="sm">
              Visualisasi Interval
            </Title>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[chartA, chartB]}
                    tickCount={8}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    domain={["auto", "auto"]}
                    tickCount={8}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#2563eb"
                    dot={false}
                    strokeWidth={2}
                  />
                  {/* a, b, c lines */}
                  <ReferenceLine
                    x={step.a}
                    stroke="#f59e42"
                    label="a"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    x={step.b}
                    stroke="#f59e42"
                    label="b"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    x={step.c}
                    stroke="#10b981"
                    label="c"
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Center mt="sm">
              <Text>
                <b>Interval:</b> [{step.a}, {step.b}] &nbsp; | &nbsp;
                <b>c:</b> {step.c}
              </Text>
            </Center>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
