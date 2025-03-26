import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginCard() {
    const { login, error: authError, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigate('/admin');
        } else {
            setError(authError || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <Card className="w-full shadow-lg bg-white">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center" style={{ color: "#025c53" }}>Admin Login</CardTitle>
                <CardDescription className="text-center" style={{ color: "rgba(2, 92, 83, 0.7)" }}>
                    Enter your credentials to access the admin dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-email" style={{ color: "#025c53" }}>Email</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-opacity-20"
                            style={{ borderColor: "rgba(2, 92, 83, 0.2)" }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-password" style={{ color: "#025c53" }}>Password</Label>
                        <Input
                            id="admin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border-opacity-20"
                            style={{ borderColor: "rgba(2, 92, 83, 0.2)" }}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full text-white"
                        style={{ backgroundColor: "#025c53" }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login to Admin Panel'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
                <p className="text-sm" style={{ color: "rgba(2, 92, 83, 0.7)" }}>
                    Forgot password? Contact the system administrator
                </p>
            </CardFooter>
        </Card>
    );
}