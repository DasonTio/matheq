// src/components/IterationTable.jsx
import { Table, ScrollArea } from "@mantine/core";
import Latex from "react-latex";

const formatNumber = (num) => {
  if (typeof num === "number") {
    if (Math.abs(num) < 1e-9 && num !== 0) return num.toExponential(4);
    return parseFloat(num.toFixed(7));
  }
  return num;
};

export default function FixedIterationTable({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = ["Iteration", "x_i", "g(x_i)", "Error |g(x_i) - x_i|"];
  const columnKeys = ["iteration", "xi", "gxi", "error"];

  const rows = data.map((row, index) => (
    <Table.Tr key={index}>
      {columnKeys.map((key) => (
        <Table.Td key={key}>{formatNumber(row[key])}</Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <ScrollArea maw="100%" type="auto">
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            {headers.map((header) => (
              <Table.Th key={header}>
                <Latex>{header}</Latex>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
