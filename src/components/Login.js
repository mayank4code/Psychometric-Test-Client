import React, { useState } from 'react'
import { server_origin } from '../utilities/constants';

import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import "../css/login.css";

// Firebase for OTP
import { auth } from "./firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const Login = () => {

    const navigate = useNavigate();

    //* IMPORTANT State: -1: EnterPhoneComponent
    //*                   0: EnterOTPComponenent
    //*                   1: EnterPasswordCheckComponenent
    //*                   2: EnterPasswordCreateComponenent
    const [componentState, setComponentState] = useState(-1);
    //*


    //* 3 Inputs mobile, otp and password
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');
    const [password, setPassword] = useState('');
    //*

    //* Checkers
    const [otpSent, setOTPSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    //*

    //*This function is called once the OTP is verified, to generate the token
    const loginUser = async () => {

        const response = await fetch(`${server_origin}/api/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile: mobileNumber })
        });
        let response1 = await response.json();
        if (response1.success) {
            localStorage.setItem('token', response1.token);
            toast.success("Logged in successfully");
            navigate("/");
        }
    }

    //These 3 functions are for OTP sending and verification
    function onCaptchVerify() {
        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    "recaptcha-container",
                    {
                        size: "invisible",
                        callback: (response) => {
                            onSignup();
                        },
                        "expired-callback": () => { },
                    },
                    auth
                );
            }
        }
        catch (err) {
            console.log("Captcha error: ", err);
        }
    }

    //! WILL WORK ONLY FOR INDIAN PHONE NUMBERS WITH +91 code.
    function onSignup() {
        //* Display EnterOTP component when OTP is sent successfully
        const mobLength = mobileNumber.length;
        if ((mobLength !== 10)) {
            toast.error("Please enter valid mobile number");
            return;
        }
        setLoading(true);
        //*Show OTP enter component
        setComponentState(0);
        onCaptchVerify();

        const appVerifier = window.recaptchaVerifier;

        const formatPh = "+91" + mobileNumber;
        // console.log(formatPh);

        signInWithPhoneNumber(auth, formatPh, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setLoading(false);
                setOTPSent(true);
                toast.success("OTP sent successfully!");
            })
            .catch((error) => {
                // toast.error("Please refresh the page and try again!");
                console.log("error1: ", error.message);
                toast.error("Some error occured.");
                setComponentState(-1);
                setLoading(false);
            });
    }

    function onOTPVerify() {
        setLoading(true);
        toast.success("Please wait");
        window.confirmationResult
            .confirm(otp)
            .then((res) => {
                //!OTP is verified, send request to server for token
                console.log("RESRES: ", res);
                // loginUser();
                setOtpVerified(true);
                setLoading(false);
                //* OTP is verified - Show Enter Password create component
                setComponentState(2);
            })
            .catch((err) => {
                console.log(err);
                toast.error("Invalid OTP")
                setLoading(false);
            });
    }

    const handleMobileNumberChange = (event) => {
        setMobileNumber(event.target.value);
    };

    const handleOTPChange = (event) => {
        setOTP(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }


    const handleLogin = () => {
        loginUser();
    }

    const handleSendOtpClick = async () => {
        //clicked on  LOGIN button
        if (mobileNumber === "9898989898") {
            //DUMMY USER. Login without OTP
            toast.success("Logged in as testing user");
            // console.log(process.env.REACT_APP_AUTH_DOMAIN);
            localStorage.setItem('token', process.env.REACT_APP_TEST_TOKEN);
            navigate("/");
            return;
        }

        // Check if the mobile is already registered
        const response = await fetch(`${server_origin}/api/user/check-mobile-registered`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({ mobile: mobileNumber })
        });
        let response1 = await response.json();
        if (response1.success === true) {
            // Already registered
            // Render Password check component
            setComponentState(1);
            return;
        }
        // Not registered before
        // Render EnterOTP component
        onSignup();
    };

    const handleVerifyOtpClick = () => {
        //* When OTP is verified show set password component
        onOTPVerify();
    };

    const handleCheckPasswordButtonClick = async () => {
        //* Check the password
        setLoading(true);
        // Check if the password is correct
        const response = await fetch(`${server_origin}/api/user/check-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: mobileNumber, password: password })
        });
        let response1 = await response.json();
        console.log("Check password response", response1);

        if (response1.success === true) {
            //* Password is correct
            toast.success("Logged in successfully.");
            localStorage.setItem('token', response1.token);
            navigate('/test/instructions');
        }
        else {
            //* Wrong password
            toast.error('Wrong password.');
        }

        setLoading(false);

    }

    const handleForgotPasswordButtonClick = () => {
        //* Show OTP 
        //! Send the OTP as user forgots the password
        onSignup();
    }


    const handleCreatePasswordButton = async () => {
        //* Create new password?
        //* After this user is logged in and token is saved

        // Create password and generate token and login
        //!Number already registered ??? update password and generate token ::: Create Password with mobile entry in DB and generate token
        const response = await fetch(`${server_origin}/api/user/login-create-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: mobileNumber, password: password })
        });
        let response1 = await response.json();
        if (response1.success) {
            toast.success("Password created successfully");
            localStorage.setItem("token", response1.token);
            navigate("/test/instructions");
        }
        else {
            toast.error("Cannot update password. Please try again later");

        }

    }

    //components //* should start with capital letter

    //Componenent 1
    const EnterPhoneComponent = () => {
        return (
            <>
                <div className="login-form">
                    <h4>Please enter your mobile number to continue.</h4>
                    <input
                        type="tel"
                        className="login-input"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        onChange={handleMobileNumberChange}
                        disabled={otpSent || loading} // Disable the input during OTP verification
                    />
                    <button
                        className="send-otp-button"
                        onClick={handleSendOtpClick}
                        disabled={loading} // Disable the button during OTP sending
                    >
                        {loading ? "Please wait..." : "Login"}
                    </button>

                </div>
            </>
        )
    }


    const EnterPasswordCheckComponent = () => {
        return (
            <>
                <div className="login-form">
                    <h4>Please enter your password to continue.</h4>
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={loading} // Disable the input during processing
                    />

                    <button
                        className="forgot-password-button btn btn-primary"
                        onClick={handleForgotPasswordButtonClick}
                    >
                        "Forgot password?"
                    </button>
                    <button
                        className="send-otp-button"
                        onClick={handleCheckPasswordButtonClick}
                    >
                        Submit
                    </button>

                </div>
            </>
        )
    }

    const EnterPasswordCreateComponent = () => {
        return (
            <>
                <div className="login-form">
                    <h4>Please enter a password</h4>
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={loading} // Disable the input during processing
                    />
                    <button
                        className="save-password-button btn btn-primary"
                        onClick={handleCreatePasswordButton}
                    >
                        Save and continue
                    </button>

                </div>
            </>
        )
    }


    const EnterOTPComponent = () => {
        return (
            <>
                {
                    <>
                        <input
                            type="text"
                            className="otp-input"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={handleOTPChange}
                            disabled={loading} // Disable the input during OTP verification
                        />
                        <button
                            className="login-button"
                            onClick={handleVerifyOtpClick}
                            disabled={loading} // Disable the button during OTP verification
                        >
                            {loading ? "Please wait..." : "Verify and login"}
                        </button>
                    </>
                }
            </>
        )
    }





    return (
        <>
            <div id="recaptcha-container"></div>

            <div className='login-heading'>
                <h2>Hello!</h2>
            </div>

            {
                componentState === -1 ? EnterPhoneComponent()
                    : (
                        componentState === 0 ? EnterOTPComponent()
                            : (
                                componentState === 1 ? EnterPasswordCheckComponent()
                                    : (
                                        componentState === 2 ? EnterPasswordCreateComponent()
                                            : ("Nothing to Show...Refresh the page")
                                    )
                            )
                    )
                    
                
            }

        </>
    );
};

export default Login;