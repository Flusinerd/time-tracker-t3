import Nav from "../../components/nav";

export default function Dashboard() {
  return (
    <>
      <div className="flex gap-4">
        <Nav></Nav>
        <main>
          <h1 className="text-4xl font-bold">Dashboard</h1>
        </main>
      </div>
    </>
  );
}
