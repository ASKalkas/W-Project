import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useCookies } from "react-cookie";
let backend_url = "http://localhost:3000/api";

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies, setCookie, removeCookies] = useCookies(["token"]);
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backend_url}/login`,
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { status, data } = response;
      if (status === 200) {
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("role", data.user.role);
        setCookie("token", data.token);
        setSuccessMessage("Login successful!");
        setErrorMessage("");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage("Login failed!");
    }
    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div className="container mt-5">
      <Form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ width: "30%" }}
      >
        <h2 className="text-center mb-4">Login Account</h2>

        <Form.Group controlId="formEmail">
          <Form.Label>Email:</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </Form.Group>
        <p></p>
        <Form.Group controlId="formPassword">
          <Form.Label>Password:</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </Form.Group>
        <p></p>
        <Button
          variant="primary"
          type="submit"
          style={{ width: "100%" }}
          className="mb-3"
        >
          Submit
        </Button>

        <div className="text-center mb-2">
          {errorMessage && <span className="text-danger">{errorMessage}</span>}
          {successMessage && (
            <span className="text-success">{successMessage}</span>
          )}
        </div>

        <div className="text-center">
          Don't have an account? <Link to={"/register"}>Signup</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login;
