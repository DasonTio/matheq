import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import MetodeTertutup from "./pages/metode_tertutup";
import NewtonRaphsonPage from "./pages/newton-raphson";
import HomePage from "./pages/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />} />
      <Route path="/metode_tertutup" element={<MetodeTertutup />} />
      <Route path="/newton-raphson" element={<NewtonRaphsonPage />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
