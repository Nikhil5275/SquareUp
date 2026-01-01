import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner, VStack, HStack, useToast, Button, useColorModeValue } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, provider, db } from "../firebase";

export default function JoinServerPage() {
    const router = useRouter();
    const toast = useToast();
    const { email, serverId, server: serverName } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");

    useEffect(() => {
        console.log('Join page loaded with params:', { email, serverId, serverName });
        console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser?.email);
            setUser(currentUser);
            if (!currentUser && email) {
                // User is not logged in, prompt them to log in
                setError(`Please log in with ${email} to join the server.`);
                setLoading(false);
            } else if (currentUser && email && (serverId || serverName)) {
                // For testing: bypass email check and allow any authenticated user to join
                console.log('Authenticated user detected, proceeding to join server:', {
                    currentUserEmail: currentUser.email,
                    invitedEmail: email
                });
                handleJoinServer(currentUser);
            } else if (!email || (!serverId && !serverName)) {
                setError("Invalid invitation link. Missing email or server information.");
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [email, serverId, router, user]);

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
            console.log('Attempting to join server with user:', currentUser?.email);
            let serverData: any = null;
            let actualServerId: string = '';

            if (serverId) {
                // New format: get server by ID
                console.log('Getting server by ID:', serverId);
                const serverDocRef = doc(db, 'servers', serverId as string);
                const serverDoc = await getDoc(serverDocRef);
                console.log('Server doc result:', { exists: serverDoc.exists(), id: serverDoc.id });

                if (!serverDoc.exists()) {
                    throw new Error(`Server not found. The invitation may be invalid.`);
                }

                serverData = serverDoc.data();
                actualServerId = serverDoc.id;
                console.log('Server data retrieved:', { name: serverData?.name, memberIds: serverData?.memberIds });
            } else if (serverName) {
                // Legacy format: find server by name
                console.log('Getting server by name:', serverName);
                const serversRef = collection(db, 'servers');
                const q = query(serversRef, where('name', '==', serverName as string));
                const querySnapshot = await getDocs(q);
                console.log('Query result:', { empty: querySnapshot.empty, size: querySnapshot.size });

                if (querySnapshot.empty) {
                    throw new Error(`Server "${serverName}" not found. The invitation may be invalid.`);
                }

                const serverDoc = querySnapshot.docs[0];
                serverData = serverDoc.data();
                actualServerId = serverDoc.id;
            } else {
                throw new Error("Server ID or name is required");
            }

            // Check if user is already a member
            if (serverData.memberIds && serverData.memberIds.includes(currentUser.uid)) {
                toast({
                    title: `Already a member`,
                    description: `You're already a member of "${serverData.name}"`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
                router.push('/');
                return;
            }

            // Add the user to the server
            const userDisplayName = currentUser.displayName || currentUser.email || 'Anonymous';
            const serverDocRef = doc(db, 'servers', actualServerId);

            await updateDoc(serverDocRef, {
                members: arrayUnion(userDisplayName),
                memberIds: arrayUnion(currentUser.uid)
            });

            console.log('Successfully added user to server:', {
                userDisplayName,
                userId: currentUser.uid,
                serverId: actualServerId,
                serverName: serverData.name
            });

            toast({
                title: `🎉 Successfully joined "${serverData.name}"!`,
                description: `You can now track expenses and collaborate with other members in real-time.`,
                status: "success",
                duration: 6000,
                isClosable: true,
            });

            // Small delay to show the success message before redirecting
            setTimeout(() => {
                router.push('/'); // Redirect to home page with their new server
            }, 1000);

        } catch (err: any) {
            console.error("Error joining server:", err);
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);

            if (err.code === 'permission-denied') {
                setError('Permission denied. Please make sure you are logged in with the correct account.');
            } else {
                setError((err as Error).message || 'Failed to join server');
            }
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

                {user && (error.includes("invited email") || error.includes("currently logged in") || error.includes("Email mismatch")) && (
                    <VStack spacing={3}>
                        <Text fontSize="sm" color={mutedText}>
                            You're currently signed in as: {user.email}
                        </Text>
                        <HStack spacing={3}>
                            <Button
                                onClick={() => {
                                    console.log('User chose to continue with current account');
                                    setError(null);
                                    handleJoinServer(user);
                                }}
                                colorScheme="green"
                                size="sm"
                            >
                                Continue with this account
                            </Button>
                            <Button
                                onClick={() => auth.signOut().then(() => router.reload())}
                                variant="outline"
                                colorScheme="red"
                                size="sm"
                            >
                                Sign out and use different account
                            </Button>
                        </HStack>
                    </VStack>
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