import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text } from '@chakra-ui/react';

export default function Login() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main page since login is handled there
        router.push('/');
    }, [router]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minH="100vh"
            bg="gray.50"
        >
            <Spinner size="xl" color="blue.500" mb={4} />
            <Text>Redirecting to SquareUp...</Text>
        </Box>
    );
}
