import Nav from "../../components/nav";

export default function Dashboard() {
  return (
    <>
      <div className="flex gap-4">
        <Nav></Nav>
        <main className="pt-4">
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        </main>
      </div>
    </>
  );
}
