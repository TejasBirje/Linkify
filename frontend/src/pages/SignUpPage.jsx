import React, { useState } from 'react'
import { Waypoints } from "lucide-react";
import { Link } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';
import useSignup from '../hooks/useSignup';
const SignUpPage = () => {

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // const queryClient = useQueryClient();

  // const { mutate: signupMutation, isPending, error } = useMutation({
  //   mutationFn: signup,  // coming from api.js

  //   // on success, we want to call the /auth/me to get the authUser, and be redirected to the HomePage. (Go see App.jsx)
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
  // })

  /* 
  Here we were directly writing the function here, which is not ideal, so we put it in a different file, api.js file. To make it cleaner
  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/signup", signupData);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["authUser"]})
  })

  */

  const {error, isPending, signUpMutation} = useSignup();

  const handleSignup = (e) => {
    e.preventDefault();  // so it does not refresh
    signUpMutation(signupData);  // calls the mutationFn() in the useQuery({}), which is in api.js
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* LEFT SIDE */}
        <div className='w-full lg:w-1/2 p-4 sm:p-8 flex flex-col'>
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Waypoints className="size-10 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Linkify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          {/* SIGNUP FORM */}
          <div className='w-full'>
            <form onSubmit={handleSignup}>
              <div className='space-y-4'>
                <div>
                  <h2 className='text-xl font-bold'>
                    Create an Account
                  </h2>
                  <p className='text-sm opacity-70'>

                  </p>
                </div>

                <div className='space-y-3'>
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      // when we start typing, update the state with the full name
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. john@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  {/* AGREE TO T&C */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy.</span>
                      </span>
                    </label>
                  </div>

                  {/* CREATE ACCOUNT BUTTON */}
                  <button className="btn btn-primary w-full" type="submit">
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  {/* ALREADY HAVE AN ACCOUNT BUTTON */}
                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/1.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with people around the world</h2>
              <p className="opacity-70">
                Speak freely. Learn naturally. Connect globally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage;

/* 
What happens when User Presses "Create Account"

1. Form Submission Triggered (handleSignup)

    e.preventDefault() prevents page reload.
    Calls: signupMutation(signupData)

2. signupMutation Executes (from useMutation)

    mutationFn: signup (comes from api.js)
    Sends POST /auth/signup request with:
    {
      fullName,
      email,
      password
    }

3. Backend Receives Signup Request

    Validates data
    Creates new user in database
    Returns success response with token or user data

4. onSuccess Callback Triggers

    Executes: queryClient.invalidateQueries({ queryKey: ["authUser"] })
    This refreshes the "authUser" query (likely triggers /auth/me API call)

5. authUser Query Refetches

    App fetches logged-in user data (like name, email, ID, etc.)
    App may now recognize user as authenticated

6. App Routing Behavior (not shown here, but in App.jsx)

    Likely detects valid authUser
    Redirects to HomePage or Dashboard (based on App.jsx logic)
*/