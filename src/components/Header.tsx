import {
  Box,
  HStack,
  Heading,
  Text,
  Button,
  VStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { FiMenu, FiLogIn } from "react-icons/fi";
import { Server } from "../types";

interface HeaderProps {
  currentServer: Server | undefined;
  user: any;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogin: () => void;
}

export const Header = ({
  currentServer,
  user,
  sidebarOpen,
  onToggleSidebar,
  onLogin,
}: HeaderProps) => {
  const bgColor = "white";
  const borderColor = "gray.200";
  const textColor = "gray.900";
  const mutedText = "gray.600";
  const primary = "#0070BA";
  const primaryHover = "#005EA6";

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
