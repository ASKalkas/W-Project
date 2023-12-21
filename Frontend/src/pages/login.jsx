//import "../stylesheets/auth.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

// import { config as dotenvConfig } from "dotenv";
// dotenvConfig();
// require("dotenv").config();
let backend_url = 'http://localhost:3000/api';



const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSucessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies, setCookie] = useCookies(["token"]);
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
      console.log('data',data)
      console.log(response)
      if (status==200) {
        // handleSuccess(message);
        localStorage.setItem("userId",data.user._id)
        localStorage.setItem("role",data.user.role)
        setCookie("token", data.token)
        // setSucessMessage(message)
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.log();
        // setErrorMessage(message);
      }
    } catch (error) {
      console.log(error);
      // setErrorMessage(error.message);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
    });
  };

  return (
    <div className="form_container" >
      <h2>Login Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
        <span>
          {errorMessage} {successMessage}
        </span>
        <span>
          Dont have an account? <Link to={"/signup"}>Signup</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;