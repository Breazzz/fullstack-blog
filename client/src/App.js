import Container from "@mui/material/Container";
import { Routes, Route, Navigate } from 'react-router-dom'

import { Header } from "./components";
import { Home, FullPost, Registration, AddPost, Login } from "./pages";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAuthMe, selectIsAuth } from "./redux/slices/auth";

function App() {
  const dispatch = useDispatch()
  const isAuth = useSelector(selectIsAuth)

  useEffect(() => {
    dispatch(fetchAuthMe())
  }, [])

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        {isAuth
          ? <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts/:id" element={<FullPost />} />
              <Route path="/posts/:id/edit" element={<AddPost  />} />
              <Route path="/add-post" element={<AddPost />} />
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          : <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
              <Route
                path="*"
                element={<Navigate to="/login" replace />}
              />
            </Routes>
        }

      </Container>
    </>
  );
}

export default App;
