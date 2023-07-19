import type { ReactElement } from "react";
import Nav from "../components/nav";


const SidenavLayout = (page: ReactElement) => {
  return (
    <>
      <div className="flex gap-4">
        <Nav></Nav>
        <main className="pt-4">
          {page}
        </main>
      </div>
    </>
  );
}

export default SidenavLayout;