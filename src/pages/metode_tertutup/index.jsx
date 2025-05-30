import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  Title,
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
  SimpleGrid,
  ActionIcon,
  Textarea,
} from "@mantine/core";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Info, ArrowRight, ArrowLeft, Backspace } from "@phosphor-icons/react";
import Latex from "react-latex";

// Mathematical keyboard layout
const mathKeyboard = [
  [
    { label: "x", latex: "x", value: "x" },
    { label: "y", latex: "y", value: "y" },
    { label: "z", latex: "z", value: "z" },
    { label: "π", latex: "\\pi", value: "Math.PI" },
    { label: "e", latex: "e", value: "Math.E" },
  ],
  [
    { label: "ln", latex: "\\ln", value: "Math.log", needsParens: true },
    { label: "log", latex: "\\log", value: "Math.log10", needsParens: true },
    { label: "sin", latex: "\\sin", value: "Math.sin", needsParens: true },
    { label: "cos", latex: "\\cos", value: "Math.cos", needsParens: true },
    { label: "tan", latex: "\\tan", value: "Math.tan", needsParens: true },
  ],
  [
    { label: "√", latex: "\\sqrt{}", value: "Math.sqrt", needsParens: true },
    { label: "x²", latex: "x^2", value: "^2" },
    { label: "xⁿ", latex: "x^n", value: "^" },
    { label: "¹⁄ₓ", latex: "\\frac{1}{x}", value: "1/" },
    { label: "()", latex: "()", value: "()" },
  ],
  [
    { label: "7", latex: "7", value: "7" },
    { label: "8", latex: "8", value: "8" },
    { label: "9", latex: "9", value: "9" },
    { label: "÷", latex: "\\div", value: "/" },
    { label: "+", latex: "+", value: "+" },
  ],
  [
    { label: "4", latex: "4", value: "4" },
    { label: "5", latex: "5", value: "5" },
    { label: "6", latex: "6", value: "6" },
    { label: "×", latex: "\\times", value: "*" },
    { label: "−", latex: "-", value: "-" },
  ],
  [
    { label: "1", latex: "1", value: "1" },
    { label: "2", latex: "2", value: "2" },
    { label: "3", latex: "3", value: "3" },
    { label: ".", latex: ".", value: "." },
    { label: "0", latex: "0", value: "0" },
  ],
];

// Parse math expression for evaluation
function parseMathExpr(expr) {
  return expr
    .replace(/Math\.PI/g, Math.PI)
    .replace(/Math\.E/g, Math.E)
    .replace(/(\d*\.?\d*)x\^(\d+)/g, (m, coef, pow) =>
      `${coef === "" ? 1 : coef}*Math.pow(x,${pow})`
    )
    .replace(/(\d*\.?\d*)x/g, (m, coef) => 
      `${coef === "" ? 1 : coef}*x`
    )
    .replace(/x\^/g, "Math.pow(x,")
    .replace(/\^(\d+)/g, (m, pow) => `,${pow})`)
    .replace(/Math\.log\(/g, "Math.log(")
    .replace(/Math\.log10\(/g, "Math.log10(")
    .replace(/Math\.sin\(/g, "Math.sin(")
    .replace(/Math\.cos\(/g, "Math.cos(")
    .replace(/Math\.tan\(/g, "Math.tan(")
    .replace(/Math\.sqrt\(/g, "Math.sqrt(");
}

// Convert expression to LaTeX
function toLatex(expr) {
  return expr
    .replace(/Math\.PI/g, "\\pi")
    .replace(/Math\.E/g, "e")
    .replace(/Math\.log\(/g, "\\ln(")
    .replace(/Math\.log10\(/g, "\\log(")
    .replace(/Math\.sin\(/g, "\\sin(")
    .replace(/Math\.cos\(/g, "\\cos(")
    .replace(/Math\.tan\(/g, "\\tan(")
    .replace(/Math\.sqrt\(/g, "\\sqrt{")
    .replace(/Math\.pow\(([^,]+),([^)]+)\)/g, "$1^{$2}")
    .replace(/\*/g, "\\cdot")
    .replace(/\//g, "\\div");
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
  const [displayExpr, setDisplayExpr] = useState(defaultExpr);
  const [a, setA] = useState(2.8);
  const [b, setB] = useState(3.0);
  const [tol, setTol] = useState(1e-6);
  const [maxSteps, setMaxSteps] = useState(10);
  const [steps, setSteps] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Refs for targeting elements
  const functionInputRef = useRef(null);
  const parametersRef = useRef(null);
  const iterationRef = useRef(null);
  const chartRef = useRef(null);
  const textareaRef = useRef(null);

  const parsedExpr = parseMathExpr(expr);

  const handleKeyboardInput = (key) => {
    const { value, needsParens } = key;
    const before = expr.substring(0, cursorPosition);
    const after = expr.substring(cursorPosition);
    
    let newExpr;
    let newCursorPos;

    if (needsParens) {
      newExpr = before + value + "(" + after;
      newCursorPos = cursorPosition + value.length + 1;
    } else if (value === "()") {
      newExpr = before + "()" + after;
      newCursorPos = cursorPosition + 1;
    } else {
      newExpr = before + value + after;
      newCursorPos = cursorPosition + value.length;
    }

    setExpr(newExpr);
    setDisplayExpr(newExpr);
    setCursorPosition(newCursorPos);
  };

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const before = expr.substring(0, cursorPosition - 1);
      const after = expr.substring(cursorPosition);
      const newExpr = before + after;
      setExpr(newExpr);
      setDisplayExpr(newExpr);
      setCursorPosition(cursorPosition - 1);
    }
  };

  const handleClear = () => {
    setExpr("");
    setDisplayExpr("");
    setCursorPosition(0);
  };

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
    setShowKeyboard(false);
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

  // Find the root (final result)
  const finalRoot = steps.length > 0 ? steps[steps.length - 1].c : null;

  return (
    <Container size="xl" py="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Title align="center" order={2} mb="md">
          Metode Biseksi (Bisection Method)
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <div ref={functionInputRef}>
              <Text size="sm" weight={500} mb={4}>
                Fungsi f(x)
              </Text>
              
              {/* LaTeX Display */}
              <Paper p="md" withBorder mb="sm" style={{ minHeight: 60, display: "flex", alignItems: "center" }}>
                <Text size="lg">
                  <Latex>{`$f(x) = ${toLatex(displayExpr)}$`}</Latex>
                </Text>
              </Paper>

              {/* Input Field */}
              <Textarea
                ref={textareaRef}
                placeholder="Masukkan fungsi matematika..."
                value={expr}
                onChange={(e) => {
                  setExpr(e.target.value);
                  setDisplayExpr(e.target.value);
                  setCursorPosition(e.target.selectionStart);
                }}
                onClick={(e) => setCursorPosition(e.target.selectionStart)}
                onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                minRows={2}
                required
              />

              <Group position="apart" mt="sm">
                <Button
                  variant="outline"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                >
                  {showKeyboard ? "Sembunyikan" : "Tampilkan"} Keyboard Matematika
                </Button>
                <Group>
                  <Button variant="subtle" onClick={handleClear}>
                    Clear
                  </Button>
                  <ActionIcon onClick={handleBackspace} variant="subtle">
                    <Backspace size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Mathematical Keyboard */}
              {showKeyboard && (
                <Paper p="md" mt="md" withBorder>
                  <Text size="sm" weight={500} mb="md">
                    Keyboard Matematika
                  </Text>
                  <Stack spacing="xs">
                    {mathKeyboard.map((row, rowIndex) => (
                      <Group key={rowIndex} spacing="xs" position="center">
                        {row.map((key, keyIndex) => (
                          <Button
                            key={keyIndex}
                            variant="default"
                            size="sm"
                            onClick={() => handleKeyboardInput(key)}
                            style={{ minWidth: 50, height: 40 }}
                          >
                            {key.label}
                          </Button>
                        ))}
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
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

            <Button type="submit" fullWidth size="lg">
              Mulai Simulasi
            </Button>
          </Stack>
        </form>

        {/* Display Root Result */}
        {finalRoot !== null && (
          <Paper p="md" mt="md" withBorder style={{ backgroundColor: "#e7f5ff" }}>
            <Group position="center">
              <Text size="lg" weight={600}>
                Akar yang ditemukan: 
              </Text>
              <Text size="xl" weight={700} color="blue">
                <Latex>{`$x \\approx ${finalRoot}$`}</Latex>
              </Text>
            </Group>
          </Paper>
        )}

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
                          <Latex>{`$f(a) = f(${currentStep.a}) = ${currentStep.fa}$`}</Latex>
                        </Text>
                      }
                    />
                    <StepBox 
                      active={currentSubStep >= 1}
                      highlighted={currentSubStep === 1}
                      title="Langkah 2."
                      content={
                        <Text>
                          <Latex>{`$f(b) = f(${currentStep.b}) = ${currentStep.fb}$`}</Latex>
                        </Text>
                      }
                    />
                    <StepBox 
                      active={currentSubStep >= 2}
                      highlighted={currentSubStep === 2}
                      title="Langkah 3."
                      content={
                        <Text>
                          <Latex>{`$c = \\frac{a + b}{2} = \\frac{${currentStep.a} + ${currentStep.b}}{2} = ${currentStep.c}$`}</Latex>
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
                            <Latex>{`$f(c) = f(${currentStep.c}) = ${currentStep.fc}$`}</Latex>
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
                        strokeWidth={3}
                        label={{ value: `a = ${currentStep.a}`, position: "topLeft" }}
                      />
                      
                      {/* Vertical line for point b */}
                      <ReferenceLine 
                        x={currentStep.b} 
                        stroke="orange" 
                        strokeWidth={3}
                        label={{ value: `b = ${currentStep.b}`, position: "topRight" }}
                      />
                      
                      {/* Vertical line for point c */}
                      {currentSubStep >= 2 && (
                        <ReferenceLine 
                          x={currentStep.c} 
                          stroke="red" 
                          strokeWidth={3}
                          label={{ value: `c = ${currentStep.c}`, position: "top" }}
                        />
                      )}
                      
                      {/* No function line - only vertical reference lines */}
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
                    <Latex>{currentTutorial.content}</Latex>
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
