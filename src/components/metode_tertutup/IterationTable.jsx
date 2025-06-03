import React from "react";
import { Paper, Title, Table, Text, ScrollArea, Badge, Group } from "@mantine/core";

const IterationTable = ({ data, method }) => {
  const formatNumber = (num) => {
    if (Math.abs(num) < 0.000001) {
      return num.toExponential(3);
    }
    return num.toFixed(8);
  };

  const getErrorColor = (error) => {
    if (error < 0.000001) return "green";
    if (error < 0.001) return "yellow";
    return "red";
  };

  const methodNames = {
    bisection: "Biseksi",
    "regula-falsi": "Regula Falsi"
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>📊 Tabel Iterasi</Title>
        <Badge variant="light" color="blue">
          {methodNames[method]} - {data.length} Iterasi
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Setiap baris menunjukkan satu langkah iterasi dalam proses pencarian akar
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">Iterasi</Table.Th>
              <Table.Th ta="center">a</Table.Th>
              <Table.Th ta="center">b</Table.Th>
              <Table.Th ta="center">c</Table.Th>
              <Table.Th ta="center">f(a)</Table.Th>
              <Table.Th ta="center">f(b)</Table.Th>
              <Table.Th ta="center">f(c)</Table.Th>
              <Table.Th ta="center">|f(c)|</Table.Th>
              <Table.Th ta="center">Interval Baru</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, index) => (
              <Table.Tr key={index}>
                <Table.Td ta="center">
                  <Badge variant="light" color="blue">
                    {row.iteration}
                  </Badge>
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.a)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.b)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.c)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fa)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fb)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fc)}
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    variant="light"
                    color={getErrorColor(row.error)}
                    size="sm"
                  >
                    {formatNumber(row.error)}
                  </Badge>
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    variant="light"
                    color={row.chosen === "left" ? "green" : "orange"}
                    size="sm"
                  >
                    {row.chosen === "left" ? "[a, c]" : "[c, b]"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          🔍 Cara Membaca Tabel:
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• <strong>a, b:</strong> Batas interval saat ini</li>
            <li>• <strong>c:</strong> Titik tengah/perkiraan akar</li>
            <li>• <strong>f(a), f(b), f(c):</strong> Nilai fungsi di titik tersebut</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>|f(c)|:</strong> Error absolut (mendekati 0)</li>
            <li>• <strong>Interval Baru:</strong> Interval untuk iterasi berikutnya</li>
            <li>• <strong>Warna Badge:</strong> Hijau = konvergen, Kuning = mendekati, Merah = jauh</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          💡 Interpretasi untuk {methodNames[method]}:
        </Text>
        {method === "bisection" ? (
          <Text size="sm" c="dimmed">
            Nilai c selalu di tengah interval [a,b]. Interval baru dipilih berdasarkan 
            tanda f(c) - jika f(a)×f(c) &lt; 0 pilih [a,c], jika tidak pilih [c,b].
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            Nilai c dihitung menggunakan interpolasi linear. Posisi c lebih dekat ke 
            ujung interval yang nilai fungsinya lebih kecil (mendekati nol).
          </Text>
        )}
      </div>
    </Paper>
  );
};

export default IterationTable;