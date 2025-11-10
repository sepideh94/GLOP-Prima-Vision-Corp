import { useEffect, useState } from "react";
import { pingHealth } from "../../../common/api/healthApi";

export default function Home() {

  const [status, setStatus] = useState("...");

  useEffect(() => {
    const checkHealth = async () => {
      const res = await pingHealth();
      setStatus(res.ok ? "API UP" : "API DOWN");
    };
    checkHealth();
  }, []);

  return (
    <div className="container mt-5 text-center">
      <h1 className="text-primary">Bienvenue sur CiblOrgaSport !</h1>
      <p>{status}</p>
    </div>
  );
}
