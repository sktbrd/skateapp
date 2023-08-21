import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex
      as="footer"
      width="full"
      align="center"
      alignSelf="flex-end"
      justifyContent="center"
    >
      <Text fontSize="xs">
          <Link href="https://docs.skatehive.app" isExternal>
            Weed Saves Lives
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
