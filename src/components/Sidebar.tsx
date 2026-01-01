import {
    Box,
    VStack,
    HStack,
    Button,
    Text,
    Input,
    Avatar,
    IconButton,
    Icon,
    useDisclosure,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiPlus, FiCheckCircle, FiX, FiServer, FiTrash2, FiLogOut, FiLogIn, FiMenu, FiSettings, FiMoon, FiSun } from "react-icons/fi";
import { SquareUpLogo } from "./Logo";
import { Server } from "../types";

interface SidebarProps {
    servers: Server[];
    selectedServerId: string | null;
    isCreatingServer: boolean;
    newServerName: string;
    user: any;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onCreateServer: () => void;
    onStartCreateServer: () => void;
    onCancelCreateServer: () => void;
    onNewServerNameChange: (name: string) => void;
    onServerSelect: (serverId: string) => void;
    onDeleteServer: (serverId: string) => void;
    onLogin: () => void;
    onLogout: () => void;
}

export const Sidebar = ({
    servers,
    selectedServerId,
    isCreatingServer,
    newServerName,
    user,
    sidebarOpen,
    onToggleSidebar,
    onCreateServer,
    onStartCreateServer,
    onCancelCreateServer,
    onNewServerNameChange,
    onServerSelect,
    onDeleteServer,
    onLogin,
    onLogout,
}: SidebarProps) => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");
    const hoverBg = useColorModeValue("gray.100", "gray.600");
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");
    const primary = "#4A7C59"; // Muted sage green
    const primaryLight = "#E8F5E8";
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box
            w={sidebarOpen ? "280px" : "0"}
            bg={cardBg}
            borderRight="1px solid"
            borderColor={borderColor}
            transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            overflow="hidden"
            display={{ base: sidebarOpen ? "block" : "none", md: "block" }}
            position={{ base: "fixed", md: "relative" }}
            h="100vh"
            zIndex={10}
            left={0}
            top={0}
            boxShadow={{ base: sidebarOpen ? "xl" : "none", md: "none" }}
        >
            <VStack spacing={0} align="stretch" h="full">
                {/* Sidebar Header */}
                <Box p={6} borderBottom="1px solid" borderColor={borderColor} bg={cardBg}>
                    <HStack justify="space-between" mb={5}>
                        <HStack spacing={3}>
                            <SquareUpLogo />
                            <VStack align="start" spacing={0}>
                                <Text fontSize="md" fontWeight="700" color={textColor} letterSpacing="-0.02em">
                                    SquareUp
                                </Text>
                                <Text fontSize="xs" color={mutedText} fontWeight="400">
                                    Expense Manager
                                </Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            aria-label="Toggle sidebar"
                            icon={<Icon as={FiX} />}
                            onClick={onToggleSidebar}
                            variant="ghost"
                            size="sm"
                            display={{ base: "flex", md: "none" }}
                            color={mutedText}
                            _hover={{ bg: hoverBg, color: textColor }}
                        />
                    </HStack>
                    <Button
                        leftIcon={<Icon as={FiPlus} />}
                        onClick={() => onStartCreateServer()}
                        bg={primary}
                        color="white"
                        size="md"
                        width="full"
                        fontWeight="600"
                        fontSize="sm"
                        rounded="lg"
                        h="44px"
                        _hover={{ bg: "#005EA6", transform: "translateY(-1px)", boxShadow: "md" }}
                        _active={{ transform: "translateY(0)" }}
                        isDisabled={!user}
                        transition="all 0.2s"
                    >
                        New Server
                    </Button>
                </Box>

                {/* Create Server Input */}
                {isCreatingServer && (
                    <Box p={5} borderBottom="1px solid" borderColor={borderColor} bg={subtleBg}>
                        <VStack spacing={3} align="stretch">
                            <Input
                                placeholder="Enter server name"
                                value={newServerName}
                                onChange={(e) => onNewServerNameChange(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") onCreateServer();
                                }}
                                size="md"
                                bg={cardBg}
                                border="1px solid"
                                borderColor={borderColor}
                                rounded="lg"
                                h="44px"
                                fontSize="sm"
                                _focus={{ borderColor: primary, boxShadow: `0 0 0 3px #E6F2FF` }}
                                _hover={{ borderColor: primary }}
                                autoFocus
                            />
                            <HStack spacing={2}>
                                <Button
                                    leftIcon={<Icon as={FiCheckCircle} />}
                                    onClick={onCreateServer}
                                    size="md"
                                    bg={primary}
                                    color="white"
                                    flex={1}
                                    fontWeight="600"
                                    fontSize="sm"
                                    rounded="lg"
                                    h="44px"
                                    _hover={{ bg: "#005EA6" }}
                                    isDisabled={!newServerName.trim()}
                                >
                                    Create
                                </Button>
                                <Button
                                    onClick={onCancelCreateServer}
                                    size="md"
                                    variant="ghost"
                                    fontSize="sm"
                                    rounded="lg"
                                    h="44px"
                                    _hover={{ bg: hoverBg }}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                )}

                {/* Servers List */}
                <Box flex={1} overflowY="auto" p={3}>
                    <VStack spacing={2} align="stretch">
                        {servers.map((server) => (
                            <Box
                                key={server.id}
                                p={3}
                                rounded="xl"
                                bg={selectedServerId === server.id ? primaryLight : "transparent"}
                                border={selectedServerId === server.id ? `2px solid ${primary}` : "2px solid transparent"}
                                cursor="pointer"
                                _hover={{
                                    bg: selectedServerId === server.id ? primaryLight : hoverBg,
                                    borderColor: selectedServerId === server.id ? primary : borderColor,
                                    transform: "translateX(2px)"
                                }}
                                onClick={() => onServerSelect(server.id)}
                                position="relative"
                                role="group"
                                transition="all 0.2s"
                            >
                                <HStack spacing={3} justify="space-between">
                                    <HStack spacing={3} flex={1} minW={0}>
                                        <Box
                                            w="40px"
                                            h="40px"
                                            bg={selectedServerId === server.id ? primary : subtleBg}
                                            rounded="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            flexShrink={0}
                                        >
                                            <Icon
                                                as={FiServer}
                                                color={selectedServerId === server.id ? "white" : primary}
                                                boxSize={5}
                                            />
                                        </Box>
                                        <VStack align="start" spacing={1} flex={1} minW={0}>
                                            <Text
                                                fontSize="sm"
                                                fontWeight={selectedServerId === server.id ? "700" : "600"}
                                                color={selectedServerId === server.id ? primary : textColor}
                                                noOfLines={1}
                                                letterSpacing="-0.01em"
                                            >
                                                {server.name}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color={selectedServerId === server.id ? primary : mutedText}
                                                fontWeight="400"
                                            >
                                                {server.members.length} {server.members.length === 1 ? 'member' : 'members'}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <IconButton
                                        aria-label="Delete server"
                                        icon={<Icon as={FiTrash2} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete "${server.name}"?`)) {
                                                onDeleteServer(server.id);
                                            }
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        opacity={{ base: 1, md: 0 }}
                                        _groupHover={{ opacity: 1 }}
                                        transition="opacity 0.2s"
                                        rounded="lg"
                                    />
                                </HStack>
                            </Box>
                        ))}
                        {servers.length === 0 && (
                            <Box p={4} textAlign="center">
                                <Icon as={FiServer} boxSize={8} color={mutedText} opacity={0.3} mb={2} />
                                <Text fontSize="xs" color={mutedText}>
                                    {user ? "Create your first server" : "Sign in to create servers"}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </Box>

                {/* Sidebar Footer */}
                <Box p={5} borderTop="1px solid" borderColor={borderColor} bg={cardBg}>
                    {user ? (
                        <>
                            <HStack spacing={3} mb={4} p={3} bg={subtleBg} rounded="xl">
                                <Avatar
                                    src={user?.photoURL}
                                    name={user?.displayName}
                                    size="md"
                                    border={`2px solid ${borderColor}`}
                                />
                                <VStack align="start" spacing={0.5} flex={1} minW={0}>
                                    <Text fontSize="sm" fontWeight="600" color={textColor} noOfLines={1}>
                                        {user?.displayName || "User"}
                                    </Text>
                                    <Text fontSize="xs" color={mutedText} noOfLines={1} fontWeight="400">
                                        {user?.email || ""}
                                    </Text>
                                </VStack>
                            </HStack>
                            <HStack spacing={2}>
                                <Button
                                    aria-label="Toggle theme"
                                    leftIcon={<Icon as={colorMode === 'dark' ? FiSun : FiMoon} />}
                                    onClick={toggleColorMode}
                                    variant="ghost"
                                    size="sm"
                                    flex={1}
                                    fontSize="xs"
                                    fontWeight="500"
                                    rounded="lg"
                                    _hover={{ bg: hoverBg }}
                                >
                                    Theme
                                </Button>
                                <Button
                                    aria-label="Sign out"
                                    leftIcon={<Icon as={FiLogOut} />}
                                    onClick={onLogout}
                                    variant="ghost"
                                    size="sm"
                                    colorScheme="red"
                                    flex={1}
                                    fontSize="xs"
                                    fontWeight="500"
                                    rounded="lg"
                                    _hover={{ bg: "red.50", color: "red.600" }}
                                >
                                    Sign Out
                                </Button>
                            </HStack>
                        </>
                    ) : (
                        <Button
                            leftIcon={<Icon as={FiLogIn} />}
                            onClick={onLogin}
                            bg={primary}
                            color="white"
                            size="md"
                            width="full"
                            fontWeight="600"
                            fontSize="sm"
                            rounded="lg"
                            h="44px"
                            _hover={{ bg: "#005EA6" }}
                        >
                            Sign In
                        </Button>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};
