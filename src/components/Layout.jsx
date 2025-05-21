import { AppShell, Burger, Group, Title, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import Latex from "react-latex";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={2}>
              <Latex>{`Root-Finding Iteration Visualizer`}</Latex>
            </Title>
          </Group>
        </Group>
      </AppShell.Header>
    </AppShell>
  );
}
