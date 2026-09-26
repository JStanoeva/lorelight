import { Routes, Route } from "react-router";

function App() {
  return (
    <>
      <h1>Welcome to Lorelight</h1>

      <Routes>
        <Route path="/" element={<h1>Main Page</h1>} />
      </Routes>
    </>
  );
}

export default App;
