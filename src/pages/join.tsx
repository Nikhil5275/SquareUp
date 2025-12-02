import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner, VStack, useToast, Button } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase"; // Assuming firebase.ts exports 'app'

const auth = getAuth(app);

export default function JoinServerPage() {
    const router = useRouter();
    const toast = useToast();
    const { token } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser && token) {
                // User is not logged in, prompt them to log in
                setError("Please log in with the invited email address to join the server.");
                setLoading(false);
            } else if (currentUser && token) {
                handleJoinServer(currentUser);
            } else if (!token) {
                setError("Invalid invitation link. No token found.");
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [token, router, user]); // Added user to dependencies

    const handleJoinServer = async (currentUser: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/handle-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, userEmail: currentUser.email, userId: currentUser.uid }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to join server');
            }

            toast({
                title: "Successfully joined server!",
                description: data.serverName ? `Welcome to ${data.serverName}!` : "",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            router.push('/'); // Redirect to home page or server dashboard
        } catch (err) {
            console.error("Error joining server:", err);
            setError((err as Error).message || 'Failed to join server');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <VStack justify="center" align="center" minH="100vh">
                <Spinner size="xl" />
                <Text>Joining server...</Text>
            </VStack>
        );
    }

    if (error) {
        return (
            <VStack justify="center" align="center" minH="100vh" p={4}>
                <Heading size="lg" color="red.500">Error</Heading>
                <Text textAlign="center">{error}</Text>
                {!user && <Button mt={4} onClick={() => router.push('/login')}>Log In</Button>} {/* Assuming a login page at /login */}
                {user && error.includes("invited email") && <Button mt={4} onClick={() => auth.signOut().then(() => router.reload())}>Log out and log in with invited email</Button>}
                <Button mt={4} onClick={() => router.push('/')}>Go to Home</Button>
            </VStack>
        );
    }

    return (
        <VStack justify="center" align="center" minH="100vh">
            <Heading size="xl">Redirecting...</Heading>
            <Text>You should be redirected shortly.</Text>
        </VStack>
    );
}
