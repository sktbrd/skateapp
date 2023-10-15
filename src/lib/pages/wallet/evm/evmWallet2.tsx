
import React from "react";
//@ts-ignore
import { usePioneer } from "@pioneer-platform/pioneer-react";
import { useState, useEffect } from "react"; // You might not need this import if it's unused
import {
    chakra,
    Stack,
    CircularProgress,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Avatar,
    AvatarBadge,
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Link,
    Menu,
    Image,
    MenuButton,
    MenuDivider,
    Icon,
    MenuItem,
    MenuList,
    Spacer,
    Text,
    useDisclosure,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    SimpleGrid,
    Card,
    CardHeader,
    Heading,
    CardBody,
    CardFooter,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Select,
  } from "@chakra-ui/react";

const EvmModal2 = () => {
    const { state, dispatch } = usePioneer();
    const { api, app, user, status } = state;
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    // local
    const [copySuccess, setCopySuccess] = useState(false);
    const [walletType, setWalletType] = useState("");
    const [walletDescriptions, setWalletDescriptions] = useState([]);
    const [walletsAvailable, setWalletsAvailable] = useState([]);
    const [metamaskPaired, setMetamaskPaired] = useState(false);
    const [keepkeyPaired, setKeepkeyPaired] = useState(false);
    const [nativePaired, setNativePaired] = useState(false);
    const [pioneerImage, setPioneerImage] = useState("");
    const [walletSettingsContext, setWalletSettingsContext] = useState("");
    const [context, setContext] = useState("");
    const [assetContext, setAssetContext] = useState("");
    const [assetContextImage, setAssetContextImage] = useState("");
    const [blockchainContext, setBlockchainContext] = useState("");
    const [pubkeyContext, setPubkeyContext] = useState("");
    const [blockchainContextImage, setBlockchainContextImage] = useState("");
    const [isSynced, setIsSynced] = useState(false);
    const [isPioneer, setIsPioneer] = useState(false);
    const [isFox, setIsFox] = useState(false);
    const [pubkeys, setPubkeys] = useState([]);
    const [balances, setBalances] = useState([]);

        console.log("user: ", user);  
        const setContextWallet = async function (wallet: string) {
            try {
              //console.log("setContextWallet: ", wallet);
              // eslint-disable-next-line no-console
              //console.log("wallets: ", app.wallets);
              const matchedWallet = app.wallets.find(
                (w: { type: string }) => w.type === wallet
              );
              //console.log("matchedWallet: ", matchedWallet);
              if (matchedWallet) {
                setWalletType(matchedWallet.type);
                const context = await app.setContext(matchedWallet.wallet);
                //console.log("result change: ", context);
                //console.log("app.context: ", app.context);
                setContext(app.context);
                //console.log(
                //   "app.pubkeyContext: ",
                //   app.pubkeyContext.master || app.pubkeyContext.pubkey
                // );
                const pubkeyContext =
                  app.pubkeyContext.master || app.pubkeyContext.pubkey;
                setPubkeyContext(pubkeyContext);
                dispatch({ type: "SET_CONTEXT", payload: app.context });
                dispatch({ type: "SET_PUBKEY_CONTEXT", payload: app.pubkeyContext });
                // dispatch({ type: "SET_WALLET", payload: wallet });
              } else {
                //console.log("No wallet matched the type of the context");
              }
            } catch (e) {
              console.error("header e: ", e);
            }
          };
          const setUser = async function () {
            try {
              if (app && app.wallets) {
                const {
                  wallets,
                  balances,
                  pubkeys,
                  pubkeyContext,
                  assetContext,
                  blockchainContext,
                } = app;
                // eslint-disable-next-line no-console
                //console.log("wallets: ", wallets);
                //console.log(
                //   "pubkeyContext: ",
                //   pubkeyContext?.master || pubkeyContext?.pubkey
                // );
                //console.log("blockchainContext: ", blockchainContext);
                setAssetContext(assetContext);
                setBlockchainContext(blockchainContext);
                if (pubkeyContext?.master || pubkeyContext?.pubkey)
                  setPubkeyContext(pubkeyContext?.master || pubkeyContext?.pubkey);
        
                for (let i = 0; i < wallets.length; i++) {
                  const wallet = wallets[i];
                  //console.log("wallet: ", wallet);

                  if (wallet.type === "metamask") {
                    setMetamaskPaired(true);
                  }
                  if (wallet.type === "keepkey") {
                    setKeepkeyPaired(true);
                  }
                  if (wallet.type === "native") {
                    setNativePaired(true);
                  }
                  wallet.paired = true;
                  wallets[i] = wallet;
                }
                // eslint-disable-next-line no-console
                //console.log("wallets: ", wallets);
                if (balances) {
                  setBalances(balances);
                }
        
                // @ts-ignore
                window.ethereum.on("accountsChanged", async function (accounts: any) {
                  // Time to reload your interface with accounts[0]!
                  // //console.log('accountsChanged: ', accounts);
                  // TODO register new pubkeys
                  const walletsPaired = app.wallets;
                  //console.log("walletsPaired: ", walletsPaired);
                  //console.log("pioneer context: ", app?.context);
                  //if context is metamask
                  if (app?.context === "metamask.wallet") {
                    //console.log("MetaMask is in context");
                    const addressMetaMask = accounts[0];
                    //console.log("addressMetaMask: ", addressMetaMask);
                    setPubkeyContext(addressMetaMask);
                    if (addressMetaMask !== app.pubkey) {
                      //push event
                      const pubkeyContext = app.pubkeyContext;
                      pubkeyContext.pubkey = addressMetaMask;
                      pubkeyContext.master = addressMetaMask;
                      pubkeyContext.address = addressMetaMask;
                      dispatch({ type: "SET_PUBKEY_CONTEXT", payload: pubkeyContext });
                    }
                  }
                  //if address[0] !== pubkey
        
                  // re-register metamask with more pubkeys
                });
              }
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line no-console
              console.error("header e: ", e);
              // setKeepKeyError("Bridge is offline!");
            }
          };
        
          useEffect(() => {
            setUser();
            console.log("app: ", app);
            console.log("app.wallets: ", app?.wallets);
            console.log("app.context: ", app?.context);
            console.log("app.assetContext: ", app?.assetContext);
            console.log("app.blockchainContext: ", app?.blockchainContext);
            console.log("app.pubkeyContext: ", app?.pubkeyContext);
            console.log("app.pubkeyContext.master: ", app?.pubkeyContext?.master);

          }, [
            status,
            app,
            app?.wallets,
            app?.context,
            app?.assetContext,
            app?.blockchainConext,
            app?.pubkeyContext,
          ]);
        
          useEffect(() => {
            dispatch({ type: "SET_CONTEXT", payload: context });
            setContext(app?.context);
          }, [app?.context]); // once on startup
        
          useEffect(() => {
            dispatch({ type: "SET_ASSET_CONTEXT", payload: app?.assetContext });
            setAssetContext(app?.assetContext?.symbol);
            //console.log(app?.assetContext);
          }, [app?.assetContext?.name]); // once on startup
        
          useEffect(() => {
            dispatch({
              type: "SET_BLOCKCHAIN_CONTEXT",
              payload: app?.blockchainContext,
            });
            setBlockchainContext(app?.blockchainContext?.name);
            //console.log(app?.blockchainContext);
          }, [app?.blockchainContext?.name]); // once on startup
        
          useEffect(() => {
            dispatch({ type: "SET_PUBKEYS_CONTEXT", payload: app?.pubkeyContext });
            setPubkeyContext(app?.pubkeyContext?.master || app?.pubkeyContext?.pubkey);
          }, [app?.pubkeyContext?.pubkey]); // once on startup
                

          return (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={100}
              >
              </MenuButton>
              <MenuList>
                <Box borderBottomWidth="1px" p="4">
                  <HStack justifyContent="space-between">


                  </HStack>
                </Box>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p="4"
                  textAlign="left"
                  maxWidth="300px"
                  width="100%"
                >
                  <div>
                    <Flex alignItems="center">
                      <small>status: {status}</small>
                    </Flex>
                    <Card
                      p={2}
                      borderRadius="md"
                      boxShadow="sm"
                      mb={2}
                      className="caip"
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center">
                          <Avatar size="md" src={app?.assetContext?.image} mr={2} />
                          <Box fontSize="sm" fontWeight="bold">
                            Asset:
                          </Box>
                        </Flex>
                        <Box fontSize="sm" textAlign="right">
                          {app?.assetContext?.symbol}
                        </Box>
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Box fontSize="xs"></Box>
                        <Box fontSize="xs" textAlign="right">
                          caip:
                        </Box>
                      </Flex>
                    </Card>
        
                    {/* Blockchain Card */}
                    <Card
                      p={2}
                      borderRadius="md"
                      boxShadow="sm"
                      mb={2}
                      className="caip"
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center">
                          <Avatar
                            size="md"
                            src={app?.blockchainContext?.image}
                            mr={2}
                          />
                          <Box fontSize="sm" fontWeight="bold">
                            Blockchain:
                          </Box>
                        </Flex>
                        <Box fontSize="sm" textAlign="right">
                          {app?.blockchainContext?.name}
                        </Box>
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Box fontSize="xs"></Box>
                        <Box fontSize="xs" textAlign="right">
                          caip:
                        </Box>
                      </Flex>
                    </Card>
        
                    {/* Pubkey Card */}
                    <Card p={2} borderRadius="md" boxShadow="sm" className="caip">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center">
                          {/*<Img*/}
                          {/*    src={[app?.pubkeyContext?.walletImage]}*/}
                          {/*    //@ts-ignore*/}
                          {/*    loader={() => <Avatar size="md" src={app?.pubkeyContext?.walletImage} />} // Fixed: Make sure <Avatar /> returns an Element*/}
                          {/*    //@ts-ignore*/}
                          {/*    unloader={() => <Avatar size="md" src={app?.pubkeyContext?.walletImage} />} // Fixed: Make sure <Avatar /> returns an Element*/}
                          {/*    container={(children) => (*/}
                          {/*        <div*/}
                          {/*            style={{*/}
                          {/*              width: "32px",*/}
                          {/*              height: "32px",*/}
                          {/*              borderRadius: "50%",*/}
                          {/*              overflow: "hidden",*/}
                          {/*            }}*/}
                          {/*        >*/}
                          {/*          {children}*/}
                          {/*        </div>*/}
                          {/*    )}*/}
                          {/*/>*/}
                          <Box fontSize="sm" fontWeight="bold">
                            Pubkey Path:
                          </Box>
                        </Flex>

                      </Flex>
                      <Flex justifyContent="space-between">

                      </Flex>
                    </Card>
                  </div>
                </Box>
        
                <MenuItem>
                  <SimpleGrid columns={3} row={1}>
                    <Card align="center" onClick={() => setContextWallet("native")}>

                      <small>Pioneer</small>
                    </Card>
                    <Card align="center" onClick={() => setContextWallet("metamask")}>
                      <CardBody>

                      </CardBody>
                      <small>MetaMask</small>
                    </Card>
                    <Card align="center" onClick={() => setContextWallet("keepkey")}>
                      <CardBody>

                      </CardBody>
                      <small>KeepKey</small>
                    </Card>
                  </SimpleGrid>
                </MenuItem>
              </MenuList>
            </Menu>
          );
        };


export default EvmModal2;
