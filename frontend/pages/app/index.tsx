import dynamic from "next/dynamic";

export const Dashboard = dynamic(
  () => import('../../modules/dashboard/Dashboard'),
  {
    ssr: false,
  }
);

function App() {
  return (
    <Dashboard />
  );
}

export default App;
