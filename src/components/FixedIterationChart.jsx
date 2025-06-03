// src/components/IterationChart.jsx
import { LineChart } from "@mantine/charts";
import { Paper, Title, Text, Box } from "@mantine/core";
import Latex from "react-latex";

const formatNumberForAxis = (value) => {
  if (value === null || value === undefined) return "";
  if (Math.abs(value) < 1e-6 && value !== 0) return value.toExponential(1);
  if (Math.abs(value) > 1e6) return value.toExponential(1);
  const fixed = parseFloat(value.toFixed(3));
  return Number.isInteger(fixed) ? fixed.toString() : fixed;
};

export default function FixedIterationChart({
  data, // Expects data points with x, g_x (for g(x)), y_equals_x (for y=x), and iterationMark
  xAxisLabel = "x",
  yAxisLabel = "y",
  title = "Fixed-Point Iteration: \\(g(x)\\) and \\(y=x\\)",
}) {
  if (!data || data.length === 0) {
    return (
      <Text c="dimmed" ta="center" mt="md">
        No data available for chart.
      </Text>
    );
  }

  const sortedData = [...data].sort((a, b) => a.x - b.x);

  const series = [
    {
      name: "g_x", // Corresponds to g(x) values
      label: "g(x)",
      color: "blue.6",
    },
    {
      name: "y_equals_x", // Corresponds to y=x values
      label: "y = x",
      color: "green.6",
      strokeDasharray: "5 5", // Dashed line for y=x
    },
  ];

  if (sortedData.some((p) => p.iterationMark !== undefined && p.iterationMark !== null)) {
    series.push({
      name: "iterationMark",
      label: "Iteration Points (x_i, g(x_i))",
      color: "red.7",
    });
  }

  return (
    <Paper shadow="xs" p="md" mt="lg" withBorder>
      <Title order={4} ta="center" mb="md">
        <Latex>{title}</Latex>
      </Title>
      <Box h={400}>
        <LineChart
          h="100%"
          data={sortedData}
          dataKey="x"
          series={series}
          curveType="linear"
          withXAxis
          withYAxis
          xAxisProps={{
            padding: { left: 20, right: 20 },
            domain: ["dataMin", "dataMax"],
            tickFormatter: formatNumberForAxis,
            label: {
              value: xAxisLabel,
              position: "insideBottomRight",
              offset: -5,
            },
            allowDuplicatedCategory: true,
          }}
          yAxisProps={{
            padding: { top: 10, bottom: 10 },
            domain: ["auto", "auto"], // Let recharts determine domain, or set based on data range
            tickFormatter: formatNumberForAxis,
            label: {
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
            },
            allowDataOverflow: false,
          }}
          tooltipProps={{
            content: ({ label, payload }) => {
              if (!payload || payload.length === 0 || label === undefined) return null;
              const xVal = formatNumberForAxis(parseFloat(label));
              return (
                <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                  <Text fw={500} mb={5}>
                    <Latex>{`$x \\approx ${xVal}$`}</Latex>
                  </Text>
                  {payload.map((item) => {
                    if (item.value === undefined || item.value === null) return null;
                    return (
                      <Text key={item.name} c={item.color} fz="sm">
                        {item.dataKey === "iterationMark" &&
                        item.payload?.tooltipLabel
                          ? `${item.payload.tooltipLabel}: `
                          : `${item.label || item.name}: `}
                        {formatNumberForAxis(item.value)}
                      </Text>
                    );
                  })}
                </Paper>
              );
            },
          }}
          dotProps={(props) => {
            // props.name is not available here, use props.dataKey
            if (
              props.dataKey === "iterationMark" &&
              props.payload.iterationMark !== undefined &&
              props.payload.iterationMark !== null
            ) {
              return {
                r: 5,
                fill: "red",
                strokeWidth: 1,
              };
            }
            return { r: 0, strokeWidth: 0, fillOpacity: 0 }; // Hide dots for other series
          }}
          connectNulls // For g(x) line if there are gaps
        />
      </Box>
    </Paper>
  );
}
