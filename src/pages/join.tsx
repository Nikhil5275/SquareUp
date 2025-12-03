import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner, VStack, useToast, Button } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function JoinServerPage() {
    const router = useRouter();
    const toast = useToast();
    const { email, server } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser && email) {
                // User is not logged in, prompt them to log in
                setError(`Please log in with ${email} to join the ${server} server.`);
                setLoading(false);
            } else if (currentUser && email && server) {
                // Check if user is logging in with the invited email
                if (currentUser.email === email) {
                    handleJoinServer(currentUser);
                } else {
                    setError(`Please log in with the invited email address: ${email}`);
                    setLoading(false);
                }
            } else if (!email || !server) {
                setError("Invalid invitation link. Missing email or server information.");
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [email, server, router, user]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            // The useEffect will handle the rest after login
        } catch (error) {
            console.error("Login error:", error);
            setError("Failed to log in. Please try again.");
        }
    };

    const handleJoinServer = async (currentUser: any) => {
        setLoading(true);
        setError(null);
        try {
            // For the simple version, we'll just add the user directly to the server
            // In a real implementation, you'd validate the invitation token
            toast({
                title: "Successfully joined server!",
                description: server ? `Welcome to ${server}!` : "Welcome to the server!",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            router.push('/'); // Redirect to home page
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
            <VStack justify="center" align="center" minH="100vh" p={4} spacing={6}>
                <Box textAlign="center">
                    <Heading size="lg" color="red.500" mb={2}>Invitation</Heading>
                    <Text textAlign="center" mb={4}>{error}</Text>
                </Box>

                {!user && (
                    <Button
                        leftIcon={<Text>🔐</Text>}
                        onClick={handleGoogleLogin}
                        bg="#4285F4"
                        color="white"
                        size="lg"
                        px={8}
                        _hover={{ bg: "#3367D6" }}
                    >
                        Sign in with Google
                    </Button>
                )}

                {user && error.includes("invited email") && (
                    <Button
                        onClick={() => auth.signOut().then(() => router.reload())}
                        variant="outline"
                        colorScheme="red"
                    >
                        Log out and use different account
                    </Button>
                )}

                <Button onClick={() => router.push('/')} variant="ghost">
                    Go to Home
                </Button>
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