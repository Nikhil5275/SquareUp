import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function LoginPage() {
  const router = useRouter();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to home
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // The useEffect will handle the redirect after login
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={8} textAlign="center">
        <Box>
          <Heading size="xl" mb={4} color={textColor}>
            Welcome to SquareUp
          </Heading>
          <Text fontSize="lg" color={mutedText} mb={6}>
            Sign in to manage your expenses and split costs with friends
          </Text>
        </Box>

        <Button
          leftIcon={<Text>🔐</Text>}
          onClick={handleGoogleLogin}
          bg="#4285F4"
          color="white"
          size="lg"
          px={8}
          py={6}
          fontSize="lg"
          _hover={{ bg: "#3367D6" }}
          borderRadius="md"
        >
          Sign in with Google
        </Button>

        <Text fontSize="sm" color="gray.500">
          Secure authentication powered by Google
        </Text>
      </VStack>
    </Box>
  );
}