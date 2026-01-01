import {
    Box,
    HStack,
    Heading,
    Text,
    Button,
    VStack,
    IconButton,
    Icon,
    Badge,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiMenu, FiLogIn, FiCreditCard, FiCheckCircle, FiZap } from "react-icons/fi";
import { Server } from "../types";

interface HeaderProps {
    currentServer: Server | undefined;
    user: any;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onLogin: () => void;
    onStripeConnect?: () => void;
    stripeAccountStatus?: 'none' | 'pending' | 'active';
    onVenmoSettings?: () => void;
    hasVenmoUsername?: boolean;
}

export const Header = ({
    currentServer,
    user,
    sidebarOpen,
    onToggleSidebar,
    onLogin,
    onStripeConnect,
    stripeAccountStatus = 'none',
    onVenmoSettings,
    hasVenmoUsername = false,
}: HeaderProps) => {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");
    const primary = "#4A7C59"; // Muted sage green
    const primaryHover = "#3D6B4A";

    return (
        <Box
            bg={bgColor}
            borderBottom="1px solid"
            borderColor={borderColor}
            px={6}
            py={4}
            boxShadow="sm"
        >
            <HStack justify="space-between" align="center">
                <HStack spacing={4}>
                    <IconButton
                        aria-label="Toggle sidebar"
                        icon={<Icon as={FiMenu} />}
                        onClick={onToggleSidebar}
                        variant="ghost"
                        size="md"
                        display={{ base: "flex", md: "none" }}
                        rounded="lg"
                        _hover={{ bg: "gray.100" }}
                    />
                    <VStack align="start" spacing={1}>
                        <Heading size="lg" fontWeight="700" color={textColor} letterSpacing="-0.03em">
                            {currentServer ? currentServer.name : "Select a server"}
                        </Heading>
                        {currentServer && (
                            <HStack spacing={4}>
                                <Text fontSize="sm" color={mutedText} fontWeight="400">
                                    {currentServer.members.length} {currentServer.members.length === 1 ? 'member' : 'members'}
                                </Text>
                                <Text fontSize="sm" color={mutedText} fontWeight="400">
                                    •
                                </Text>
                                <Text fontSize="sm" color={mutedText} fontWeight="400">
                                    {currentServer.debts.length} {currentServer.debts.length === 1 ? 'expense' : 'expenses'}
                                </Text>
                            </HStack>
                        )}
                    </VStack>
                </HStack>
                <HStack spacing={3}>
                    {user && onVenmoSettings && (
                        <Button
                            leftIcon={<Icon as={hasVenmoUsername ? FiCheckCircle : FiZap} />}
                            onClick={onVenmoSettings}
                            variant={hasVenmoUsername ? 'outline' : 'solid'}
                            bg={hasVenmoUsername ? 'transparent' : '#3D95CE'}
                            color={hasVenmoUsername ? 'blue.600' : 'white'}
                            borderColor={hasVenmoUsername ? 'blue.300' : 'transparent'}
                            size="sm"
                            fontWeight="600"
                            fontSize="xs"
                            rounded="lg"
                            px={4}
                            h="36px"
                            _hover={{ 
                                bg: hasVenmoUsername ? 'blue.50' : '#2D7BB8', 
                                transform: "translateY(-1px)", 
                                boxShadow: "md" 
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                        >
                            {hasVenmoUsername ? 'Venmo Set' : 'Venmo'}
                        </Button>
                    )}
                    {user && onStripeConnect && (
                        <Button
                            leftIcon={<Icon as={stripeAccountStatus === 'active' ? FiCheckCircle : FiCreditCard} />}
                            onClick={onStripeConnect}
                            variant={stripeAccountStatus === 'active' ? 'outline' : 'solid'}
                            bg={stripeAccountStatus === 'active' ? 'transparent' : primary}
                            color={stripeAccountStatus === 'active' ? 'green.600' : 'white'}
                            borderColor={stripeAccountStatus === 'active' ? 'green.300' : 'transparent'}
                            size="sm"
                            fontWeight="600"
                            fontSize="xs"
                            rounded="lg"
                            px={4}
                            h="36px"
                            _hover={{ 
                                bg: stripeAccountStatus === 'active' ? 'green.50' : primaryHover, 
                                transform: "translateY(-1px)", 
                                boxShadow: "md" 
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                        >
                            {stripeAccountStatus === 'active' ? 'Payment Ready' : 'Connect Payment'}
                        </Button>
                    )}
                    {!user && (
                        <Button
                            leftIcon={<Icon as={FiLogIn} />}
                            onClick={onLogin}
                            bg={primary}
                            color="white"
                            size="md"
                            fontWeight="600"
                            fontSize="sm"
                            rounded="lg"
                            px={6}
                            h="44px"
                            _hover={{ bg: primaryHover, transform: "translateY(-1px)", boxShadow: "md" }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                        >
                            Sign In
                        </Button>
                    )}
                </HStack>
            </HStack>
        </Box>
    );
};
