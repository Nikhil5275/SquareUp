import { Box, Icon } from "@chakra-ui/react";

interface LogoProps {
    isDark?: boolean;
}

export const SquareUpLogo = ({ isDark }: LogoProps) => (
    <Box
        w="40px"
        h="40px"
        bg="#0070BA"
        display="flex"
        alignItems="center"
        justifyContent="center"
        rounded="xl"
        boxShadow="0 2px 8px rgba(0,112,186,0.2)"
    >
        <Icon viewBox="0 0 24 24" boxSize={6} color="#ffffff">
            <path fill="currentColor" d="M12 4l-6 8h4v8h4v-8h4z" />
        </Icon>
    </Box>
);
