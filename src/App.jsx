import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import HomePage from "./pages/Home";
import NewtonRaphsonPage from "./pages/newton-raphson";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<HomePage />} />
      <Route path="newton-raphson" element={<NewtonRaphsonPage />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
