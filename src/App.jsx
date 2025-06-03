import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import MetodeTertutup from "./pages/metode_tertutup";
import MetodeSecant from "./pages/metode_secant";
import NewtonRaphsonPage from "./pages/newton-raphson";
import HomePage from "./pages/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />} />
      <Route path="/metode_tertutup" element={<MetodeTertutup />} />
      <Route path="/metode_secant" element={<MetodeSecant />} />
      <Route path="/newton-raphson" element={<NewtonRaphsonPage />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
