import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import HomePage from "./pages/Home";
import MetodeTertutup from "./pages/metode_tertutup";
import MetodeSecant from "./pages/metode_secant";
import LoginPage from "./pages/login";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />} />
      <Route path="/metode_tertutup" element={<MetodeTertutup />} />
      <Route path="/metode_secant" element={<MetodeSecant />} />
      <Route path="/login" element={<LoginPage />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
