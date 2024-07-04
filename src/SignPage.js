import React, { useState, useEffect } from 'react';
import './SignPage.css';
import Swal from 'sweetalert2';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCgyCXHMuQvI-ilCOVQIyjUuR464qNqE4s",
  authDomain: "npk-data-tracker-655de.firebaseapp.com",
  projectId: "npk-data-tracker-655de",
  storageBucket: "npk-data-tracker-655de.appspot.com",
  messagingSenderId: "838481789154",
  appId: "1:838481789154:web:ca4022ef49730c28bb1ebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);


  useEffect(() => {
    const container = document.getElementById("container");
    setTimeout(() => {
      container.classList.add("sign-in");
    }, 200);
  }, []);

  const toggle = () => {
    const container = document.getElementById("container");
    container.classList.toggle("sign-in");
    container.classList.toggle("sign-up");
    setIsSignIn(!isSignIn);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        Swal.fire({
          title: "Account Created!",
          text: "Your account has been successfully created.",
          icon: "success"
        }).then((result) => {
          if (result.isConfirmed) {
            // Switch to sign-in form
            toggle();
          }
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error"
        });
      });
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const email = e.target.email2.value;
    const password = e.target.password2.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Signed in successfully"
        });

        setTimeout(() => {
          // Redirect or perform any action after successful sign in
         window.location.href = "/Dashboard"
          
        }, 3000);
      })
      .catch((error) => {
        const errorMessage = error.message;
        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error"
        });
      });
  };

  return (
    <div id="container" className="container">
      <div className="row">
        <div className="col align-items-center flex-col sign-up">
          <div className="form-wrapper align-items-center">
            <form className="form sign-up" onSubmit={handleSignUp}>
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="text"id="fname" placeholder="Username" />
              </div>
              <div className="input-group">
                <i className='bx bx-mail-send'></i>
                <input type="email" id="email" placeholder="Email" />
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" id="password" placeholder="Password" />
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" placeholder="Confirm password" />
              </div>
              <button type="submit">Sign up</button>
              <p style={{ color: "black", fontSize:"16px" }}>
                <span>Already have an account?</span>
                <b onClick={toggle} className="pointer"><u>Sign in here</u></b>
              </p>
            </form>
          </div>
        </div>
        <div className="col align-items-center flex-col sign-in">
          <div className="form-wrapper align-items-center">
            <form className="form sign-in" onSubmit={handleSignIn}>
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="email" id="email2" placeholder="Email" />
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" id="password2" placeholder="Password" />
              </div>
              <button type="submit">Sign in</button>
              <p style={{ color: "black", fontSize:"16px"}  }>
                <span >Don't have an account?</span>
                <b onClick={toggle} className="pointer"><u>Sign up here</u></b>
              </p>
            </form>
          </div>
        </div>
      </div>
      <div className="row content-row">
        <div className="col align-items-center flex-col">
          <div className="text sign-in" style={{ color: "black" }}>
            <h2>Welcome</h2>
          </div>
          <div className="img sign-in"></div>
        </div>
        <div className="col align-items-center flex-col">
          <div className="img sign-up"></div>
          <div className="text sign-up" style={{ color: "black" }}>
            <h2>Create an account</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignPage;