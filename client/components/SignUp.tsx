'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

import React, { useState } from 'react';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [showVerification, setShowVerification] = useState(false);

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleSubmit(e as any);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Registration successful! Please verify your email.');
                setVerificationToken(data.verificationToken); // In production, this would be sent via email
                setShowVerification(true);
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    phoneNumber: ''
                });
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationToken) {
            setError('No verification token available');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: verificationToken }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Email verified successfully! You can now log in.');
                setShowVerification(false);
                // In a real Next.js app, this would redirect to login page
                setTimeout(() => {
                    alert('Redirecting to login page...');
                }, 2000);
            } else {
                setError(data.error || 'Email verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (data.success) {
                setVerificationToken(data.verificationToken);
                setSuccess('Verification email sent again!');
            } else {
                setError(data.error || 'Failed to resend verification');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Resend verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={() => alert('Navigate to login page')}
                        className="font-medium text-indigo-600 hover:text-indigo-500 bg-transparent border-none underline cursor-pointer"
                    >
                        Sign in
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!showVerification ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <div className="mt-1">
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Must be at least 8 characters with uppercase, lowercase, and number
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handleButtonClick}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Verify Your Email
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    We've sent a verification link to your email. For demo purposes, use the button below to verify.
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Demo Mode:</strong> Verification token: <br />
                                    <code className="text-xs break-all">{verificationToken}</code>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleVerifyEmail}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Email'}
                                </button>

                                <button
                                    onClick={handleResendVerification}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Resending...' : 'Resend Verification Email'}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignUp;