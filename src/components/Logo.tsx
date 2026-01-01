import { Box, Icon, useColorModeValue } from "@chakra-ui/react";

export const SquareUpLogo = () => {
    const bgColor = useColorModeValue("#4A7C59", "#2D3748"); // Muted green or dark
    const shadowColor = useColorModeValue("rgba(74,124,89,0.2)", "rgba(0,0,0,0.3)");

    return (
        <Box
            w="40px"
            h="40px"
            bg={bgColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            rounded="lg"
            boxShadow={`0 2px 8px ${shadowColor}`}
        >
            <Icon viewBox="0 0 24 24" boxSize={6} color="#ffffff">
                <path fill="currentColor" d="M12 4l-6 8h4v8h4v-8h4z" />
            </Icon>
        </Box>
    );
};
