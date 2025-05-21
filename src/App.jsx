import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/login";
import IterationPage from "./pages/iteration"
import Layout from "./components/Layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />} />
      <Route path="/iteration" element={<IterationPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
