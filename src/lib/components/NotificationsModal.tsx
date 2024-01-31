import { Client } from "@hiveio/dhive";
import * as dhive from "@hiveio/dhive";
import { useState, useEffect } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    Text,
    PopoverBody,
    PopoverCloseButton,
    Box,
    HStack,
    VStack,
    Image,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";
import { FaLink } from "react-icons/fa";
import axios from "axios";
import useAuthUser from "lib/pages/wallet/hive/useAuthUser";

// types.ts
export interface Notification {
    date: string;
    id: number;
    msg: string;
    score: number;
    type: string;
    url: string;
}

export interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

const dhiveClient = new dhive.Client([
    'https://api.hive.blog',
    'https://api.hivekings.com',
    'https://anyx.io',
    'https://api.openhive.network',
]);



const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
    const [notificationArray, setNotificationArray] = useState<Notification[]>([]);
    const [authorProfiles, setAuthorProfiles] = useState<Record<string, string>>({});
    const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";
    const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
    const loggedIn = isLoggedIn();

    const msgRegex = /@([\w-]+)\s(.+)/;

    const extractMsgDetails = (msg: string) => {
        const match = msg.match(msgRegex);
        return match ? { author: match[1], text: match[2] } : { author: '', text: msg };
    };

    const [avatarSrcMap, setAvatarSrcMap] = useState<Record<string, string | null>>({});
    const calculateTimeAgo = (timestamp: string) => {
        const notificationTime = new Date(timestamp);

        // Get the user's local time zone offset in minutes
        const userTimeZoneOffset = new Date().getTimezoneOffset();

        // Adjust the notification time to the user's local time zone
        const notificationTimeLocal = new Date(notificationTime.getTime() - userTimeZoneOffset * 60 * 1000);

        const timeDifference = new Date().getTime() - notificationTimeLocal.getTime();
        const minutesAgo = Math.floor(timeDifference / (1000 * 60));

        // If the notification time is more than 24 hours ago, show the full date
        if (minutesAgo > 24 * 60) {
            return notificationTimeLocal.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        }

        // Otherwise, show the time difference in a user-friendly manner
        return `${Math.abs(minutesAgo)} ${Math.abs(minutesAgo) === 1 ? 'minute' : 'minutes'} ago`;
    };


    const fetchAvatarAndFallback = async (authors: string[]): Promise<void> => {
        try {

            const dhive_profiles = await dhiveClient.database.getAccounts(authors);
            const avatarSrcMap: Record<string, string | null> = {};

            dhive_profiles.forEach(profile => {
                const author = profile.name;
                const json_metadata = JSON.parse(profile.posting_json_metadata);
                const profileImage = json_metadata.profile?.profile_image;

                avatarSrcMap[author] = profileImage;
            });

            // Use the callback form to ensure the state is updated correctly
            setAvatarSrcMap(prevMap => ({
                ...prevMap,
                ...avatarSrcMap,
            }));
        } catch (error) {
            // Fallback to default avatar for failed requests
            authors.forEach(author => {
                setAvatarSrcMap(prevMap => ({
                    ...prevMap,
                    [author]: DEFAULT_AVATAR_URL,
                }));
            });
        }
    };

    useEffect(() => {
        // Fetch avatar for unique authors in notifications
        const uniqueAuthors = Array.from(new Set(notifications.map(notification => extractMsgDetails(notification.msg).author)));
        fetchAvatarAndFallback(uniqueAuthors);
    }, [notifications]);



    return (
        <Popover isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>
                <Text></Text>
            </PopoverTrigger>
            <PopoverContent maxH={'756px'} minW={'80%'} bg="black" color="white" borderColor="limegreen">
                <PopoverCloseButton />
                <PopoverHeader>Notifications</PopoverHeader>
                <PopoverBody overflow={'auto'}>
                    {notifications.map((notification) => {
                        const author = extractMsgDetails(notification.msg).author;
                        const avatarSrc = avatarSrcMap[author];

                        return (
                            <Box key={notification.id} mb={4} p={4} borderWidth="1px" borderRadius="md">
                                <HStack spacing={4}>
                                    <Box boxSize={'56px'}>
                                        <Link to={`https://skatehive.app/profile/${author}`} style={{ cursor: 'pointer', textDecoration: 'none' }}>

                                            <VStack>
                                                {avatarSrc && (
                                                    <Image
                                                        src={String(avatarSrc)}
                                                        alt="Author Avatar"
                                                        boxSize="40px"
                                                        borderRadius="full"
                                                        objectFit="cover"
                                                        mr={2}
                                                        onError={(e) => {
                                                            console.error('Error loading image:', e);
                                                            e.currentTarget.src = DEFAULT_AVATAR_URL;
                                                        }}
                                                    />
                                                )}
                                                <Text color="orange" fontSize="10px" fontWeight="bold">
                                                    {extractMsgDetails(notification.msg).author}
                                                </Text>
                                            </VStack>
                                        </Link>
                                    </Box>

                                    <Text fontSize="sm">{extractMsgDetails(notification.msg).text}</Text>


                                    <Link
                                        to={`https://skatehive.app/post/hive-173115/${notification.url}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <FaLink />
                                    </Link>
                                </HStack>
                                <Text align={"right"} fontSize="xs" color="gray.500">
                                    {calculateTimeAgo(notification.date)}
                                </Text>
                            </Box>
                        );
                    })}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};




export default NotificationModal;