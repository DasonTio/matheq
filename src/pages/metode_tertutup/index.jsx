import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  Button,
  Group,
  Text,
  Stack,
  Box,
  Divider,
  Card,
  Grid,
  Popover,
  Portal,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Info, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

// Parse math expression like "-0.9x^2 + 1.7x + 2.5"
function parseMathExpr(expr) {
  return expr
    .replace(/(\d*\.?\d*)x\^(\d+)/g, (m, coef, pow) =>
      `${coef === "" ? 1 : coef}*Math.pow(x,${pow})`
    )
    .replace(/([0-9])x/g, "$1*x")
    .replace(/\bx\b/g, "x");
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
    return { x: Number(x.toFixed(6)), y: safeEval(expr, x) };
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
      a: Number(a.toFixed(6)),
      b: Number(b.toFixed(6)),
      c: Number(c.toFixed(6)),
      fa: Number(fa.toFixed(6)),
      fb: Number(fb.toFixed(6)),
      fc: Number(fc.toFixed(6)),
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

const defaultExpr = "-0.9*x^2 + 1.7*x + 2.5";

export default function MetodeTertutup() {
  const [expr, setExpr] = useState(defaultExpr);
  const [a, setA] = useState(2.8);
  const [b, setB] = useState(3.0);
  const [tol, setTol] = useState(1e-6);
  const [maxSteps, setMaxSteps] = useState(10);
  const [steps, setSteps] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Refs for targeting elements
  const functionInputRef = useRef(null);
  const parametersRef = useRef(null);
  const iterationRef = useRef(null);
  const chartRef = useRef(null);

  const parsedExpr = parseMathExpr(expr);

  const handleSubmit = (e) => {
    e.preventDefault();
    const s = bisectionSteps(
      parsedExpr,
      Number(a),
      Number(b),
      Number(tol),
      Number(maxSteps)
    );
    setSteps(s);
    setShowTutorial(true);
    setCurrentIteration(0);
    setCurrentSubStep(0);
  };

  const currentStep = steps[currentIteration] || {};
  const totalSteps = steps.length * 4;
  const currentTutorialStep = currentIteration * 4 + currentSubStep;

  // Tutorial steps configuration
  const getTutorialConfig = () => {
    const stepIndex = currentSubStep;
    
    switch (stepIndex) {
      case 0:
        return {
          target: iterationRef,
          title: `Iterasi ${currentStep.step} - Langkah 1`,
          content: `f(a) = f(${currentStep.a}) = ${currentStep.fa}`,
          detail: "Hitung nilai fungsi pada batas bawah interval",
          position: "right",
        };
      case 1:
        return {
          target: iterationRef,
          title: `Iterasi ${currentStep.step} - Langkah 2`,
          content: `f(b) = f(${currentStep.b}) = ${currentStep.fb}`,
          detail: "Hitung nilai fungsi pada batas atas interval",
          position: "right",
        };
      case 2:
        return {
          target: iterationRef,
          title: `Iterasi ${currentStep.step} - Langkah 3`,
          content: `c = (a + b) / 2 = (${currentStep.a} + ${currentStep.b}) / 2 = ${currentStep.c}`,
          detail: "Tentukan titik tengah interval",
          position: "right",
        };
      case 3:
        return {
          target: chartRef,
          title: `Iterasi ${currentStep.step} - Langkah 4`,
          content: `f(c) = f(${currentStep.c}) = ${currentStep.fc}`,
          detail: `${currentStep.chosen === "left" 
            ? "f(a) × f(c) < 0, pilih interval [a, c]"
            : "f(c) × f(b) < 0, pilih interval [c, b]"
          }`,
          position: "left",
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialConfig();
  const isLastStep = currentIteration === steps.length - 1 && currentSubStep === 3;

  // Generate chart data with zoom based on current interval
  const chartMargin = Math.abs(currentStep.b - currentStep.a) * 0.3 || 0.2;
  const chartA = (currentStep.a || a) - chartMargin;
  const chartB = (currentStep.b || b) + chartMargin;
  const chartData = generateChartData(parsedExpr, chartA, chartB);

  const handleNext = () => {
    if (currentSubStep < 3) {
      setCurrentSubStep(currentSubStep + 1);
    } else if (currentIteration < steps.length - 1) {
      setCurrentIteration(currentIteration + 1);
      setCurrentSubStep(0);
    }
  };

  const handlePrev = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else if (currentIteration > 0) {
      setCurrentIteration(currentIteration - 1);
      setCurrentSubStep(3);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Title align="center" order={2} mb="md">
          Metode Biseksi (Bisection Method)
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <div ref={functionInputRef}>
              <TextInput
                label="Fungsi f(x)"
                description="Contoh: -0.9*x^2 + 1.7*x + 2.5"
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                required
              />
            </div>

            <div ref={parametersRef}>
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
              <Group grow mt="sm">
                <NumberInput
                  label="Toleransi"
                  value={tol}
                  onChange={setTol}
                  precision={8}
                  required
                />
                <NumberInput
                  label="Maksimal Iterasi"
                  value={maxSteps}
                  onChange={setMaxSteps}
                  required
                />
              </Group>
            </div>

            <Button type="submit" fullWidth>
              Mulai Simulasi
            </Button>
          </Stack>
        </form>

        {steps.length > 0 && (
          <Grid mt="xl" gutter="xl" align="flex-start">
            <Grid.Col span={12} md={6}>
              <div ref={iterationRef}>
                <Card 
                  shadow="sm" 
                  radius="md" 
                  p="lg" 
                  withBorder
                  style={{
                    border: showTutorial && (currentSubStep <= 2) 
                      ? "3px solid #228be6" 
                      : undefined,
                  }}
                >
                  <Group position="apart" mb="md">
                    <Title order={4}>
                      Iterasi {currentStep.step} dari {steps.length}
                    </Title>
                    <Badge color="blue" variant="light">
                      Langkah {currentSubStep + 1}
                    </Badge>
                  </Group>
                  <Divider mb="md" />
                  
                  <Stack spacing="md">
                    <StepBox 
                      active={currentSubStep >= 0}
                      highlighted={currentSubStep === 0}
                      title="Langkah 1."
                      content={
                        <Text>
                          f(a) = f({currentStep.a}) = {currentStep.fa}
                        </Text>
                      }
                    />
                    <StepBox 
                      active={currentSubStep >= 1}
                      highlighted={currentSubStep === 1}
                      title="Langkah 2."
                      content={
                        <Text>
                          f(b) = f({currentStep.b}) = {currentStep.fb}
                        </Text>
                      }
                    />
                    <StepBox 
                      active={currentSubStep >= 2}
                      highlighted={currentSubStep === 2}
                      title="Langkah 3."
                      content={
                        <Text>
                          c = (a + b) / 2 = ({currentStep.a} + {currentStep.b}) / 2 = {currentStep.c}
                        </Text>
                      }
                    />
                    <StepBox 
                      active={currentSubStep >= 3}
                      highlighted={currentSubStep === 3}
                      title="Langkah 4."
                      content={
                        <Stack spacing={4}>
                          <Text>
                            f(c) = f({currentStep.c}) = {currentStep.fc}
                          </Text>
                          {currentSubStep >= 3 && (
                            <Text size="sm" color="blue" weight={500}>
                              {currentStep.chosen === "left" 
                                ? "f(a) × f(c) < 0, pilih interval [a, c]"
                                : "f(c) × f(b) < 0, pilih interval [c, b]"
                              }
                            </Text>
                          )}
                        </Stack>
                      }
                    />
                  </Stack>

                  {/* Navigation Buttons */}
                  <Group position="right" mt="lg">
                    <Button
                      variant="default"
                      size="sm"
                      leftIcon={<ArrowLeft size={14} />}
                      onClick={handlePrev}
                      disabled={currentIteration === 0 && currentSubStep === 0}
                    >
                      Sebelumnya
                    </Button>
                    
                    {isLastStep ? (
                      <Button
                        size="sm"
                        onClick={() => setShowTutorial(false)}
                      >
                        Selesai
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        rightIcon={<ArrowRight size={14} />}
                        onClick={handleNext}
                      >
                        Selanjutnya
                      </Button>
                    )}
                  </Group>
                </Card>
              </div>
            </Grid.Col>

            <Grid.Col span={12} md={6}>
              <div ref={chartRef}>
                <Paper 
                  p="md" 
                  withBorder
                  style={{
                    border: showTutorial && currentSubStep === 3 
                      ? "3px solid #228be6" 
                      : undefined,
                  }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart 
                      data={chartData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        type="number"
                        scale="linear"
                        domain={[chartA, chartB]}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value?.toFixed(4), name]}
                        labelFormatter={(value) => `x = ${value?.toFixed(4)}`}
                      />
                      
                      {/* Vertical line for point a */}
                      <ReferenceLine 
                        x={currentStep.a} 
                        stroke="green" 
                        strokeWidth={2}
                        label={{ value: `a = ${currentStep.a}`, position: "topLeft" }}
                      />
                      
                      {/* Vertical line for point b */}
                      <ReferenceLine 
                        x={currentStep.b} 
                        stroke="orange" 
                        strokeWidth={2}
                        label={{ value: `b = ${currentStep.b}`, position: "topRight" }}
                      />
                      
                      {/* Vertical line for point c */}
                      {currentSubStep >= 2 && (
                        <ReferenceLine 
                          x={currentStep.c} 
                          stroke="red" 
                          strokeWidth={2}
                          label={{ value: `c = ${currentStep.c}`, position: "top" }}
                        />
                      )}
                      
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#228be6"
                        strokeWidth={2}
                        dot={false}
                        name="f(x)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <Text mt="md" size="sm" color="dimmed" align="center">
                    Interval: [{currentStep.a}, {currentStep.b}]
                  </Text>
                </Paper>
              </div>
            </Grid.Col>
          </Grid>
        )}

        {/* Tutorial Popover */}
        {showTutorial && currentTutorial && (
          <Portal>
            <Popover
              opened={showTutorial}
              position={currentTutorial.position}
              withArrow
              shadow="lg"
              radius="md"
              zIndex={1000}
            >
              <Popover.Target>
                <Box
                  style={{
                    position: "absolute",
                    top: currentTutorial.target === chartRef ? "50%" : "30%",
                    left: currentTutorial.target === chartRef ? "70%" : "30%",
                    width: 1,
                    height: 1,
                    pointerEvents: "none",
                    zIndex: 999,
                  }}
                />
              </Popover.Target>
              <Popover.Dropdown>
                <Stack spacing="sm" style={{ minWidth: 250, maxWidth: 350 }}>
                  <Group position="apart">
                    <ThemeIcon color="blue" variant="light">
                      <Info size={16} />
                    </ThemeIcon>
                    <Badge size="sm">
                      {currentTutorialStep + 1} / {totalSteps}
                    </Badge>
                  </Group>
                  
                  <Title order={5}>{currentTutorial.title}</Title>
                  <Text size="sm">
                    {currentTutorial.content}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {currentTutorial.detail}
                  </Text>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Portal>
        )}
      </Paper>
    </Container>
  );
}

// Helper component for step boxes
function StepBox({ active, highlighted, title, content }) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: highlighted 
          ? theme.colors.yellow[0] 
          : active 
            ? theme.colors.blue[0] 
            : theme.colors.gray[0],
        border: `2px solid ${
          highlighted 
            ? theme.colors.yellow[4] 
            : active 
              ? theme.colors.blue[3] 
              : theme.colors.gray[3]
        }`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        opacity: active ? 1 : 0.5,
        transition: "all 0.3s ease",
      })}
    >
      <Text weight={500} mb={4}>
        {title}
      </Text>
      {active && content}
    </Box>
  );
}
