import { HealthStatus } from "./HealthStatus";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Monorepo Demo</h1>
      <HealthStatus />
    </main>
  );
}
