import { Flex, Text, Image, Button, Box, Table, Thead, Tbody, Tr, Th, Td, Link } from "@chakra-ui/react";
import useAuthUser from "lib/components/auth/useAuthUser";
import { useEffect, useState } from "react";
import {
  setStore,
  getStore,
  removeStore,
  getUpdate,
  getFullStore,
  setFullStore
} from "lib/pages/qfs/gamestore";

// API URL
const API = "https://qfs.herokuapp.com";
// const API = "https://stoken.quest";
// const API = "http://localhost:3000";

export default function QFS() {

  const { user } = useAuthUser();
  const { isLoggedIn } = useAuthUser();

  // interfaces for API data
  interface UserStats {
    username: string;
    highscore: number;
    time: number;
  }

  interface Leaderboard {
    username: string;
    highscore: number;
  }

  interface BestTimes {
    username: string;
    time: number;
  }

  interface RewardPool {
    name: string;
    link: string;
    reward: string;
    isVoted: boolean;
  }

  const [userStats, setUserStats] = useState<UserStats>({ username: "guest", highscore: 0, time: 0 });
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [bestTimes, setBestTimes] = useState<BestTimes[]>([]);
  const [rewardPool, setRewardPool] = useState<RewardPool>();

  // utility functions for API
  const getLeaderboard = async () => {
    const response = await fetch(API + "/leaderboard");
    const data = await response.json();
    setLeaderboard(data);
  };

  const getBestTimes = async () => {
    const response = await fetch(API + "/times");
    const data = await response.json();
    setBestTimes(data);
  };

  const getRewardPool = async () => {
    const response = await fetch(API + "/rewardpool");
    const data = await response.json();

    const { post } = data;

    // calculate reward pool after deducting curation and hive power
    const pendingPayout = parseFloat(post.pending_payout_value.split(' ')[0]) / 2;
    const reward = (pendingPayout / 2).toFixed(3);

    // check if user has already voted (for later use)
    const isVoted = post.active_votes.some((vote: any) => vote.voter === user?.name);

    setRewardPool({
      name: post.title,
      link: `https://skatehive.app/profile/@${post.author}/${post.permlink}`,
      reward,
      isVoted
    });
  };

  const loadUserStats = async () => {
    // if user is not logged in load game without stats
    if (!user?.name) {
      loadGame();
      return;
    }

    // get user stats from API
    const response = await fetch(API + "/getuser/" + user?.name);
    const data = await response.json();
    setUserStats({
      username: data.username,
      highscore: data.highscore,
      time: data.time,
    });

    // event that is used to detect changes in local storage (game storage)
    window.addEventListener('storage', async () => {
      const update = getUpdate();

      if (!update) {
        return;
      } else {
        removeStore("Update");
        await pushStats();
      }
    });

    // trigger event to check for changes in game storage
    window.dispatchEvent(new Event('storage'));

    // load game iframe
    loadGame();
  };

  const setContent = () => {
    const game = document.querySelector("iframe");

    // send user stats to child iframe
    game?.contentWindow?.postMessage({
      name: 'setStats',
      data: getFullStore(),
    }, '*');
  }

  // load game iframe
  const loadGame = () => {    
    const game = document.querySelector("iframe");
    game?.setAttribute("src", API + "/QFS/game");

    // setContent();

    // fetch message from child iframe
    window.addEventListener("message", async (event) => {
      // if message is to set user stats
      if (event.data.name === "setStats") {
        setFullStore(event.data.data);

        // trigger event to check for changes in game storage
        window.dispatchEvent(new Event('storage'));
      }

      // if message is to get user stats
      if (event.data.name === "getStats") {
        setContent();
      }
    });
  };

  const pushStats = async () => {

    // get user stats from game storage
    const username = getStore("Username") || "guest";
    const highscore = getStore("Highscore") || 0;
    const time = getStore("Time") || 0;

    // if user is guest, don't push stats
    if (username === "guest") {
      return;
    }

    // post user stats to API
    await fetch(API + "/pushscore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        highscore,
        time,
      })
    });

    // update user stats
    setUserStats({
      username,
      highscore: highscore ? parseFloat(highscore) : 0,
      time: time ? parseInt(time) : 0,
    });

    // update leaderboard and best times
    getLeaderboard();
    getBestTimes();
  };

  useEffect(() => {
    if (userStats.username !== "guest") {
      // if user is not guest, save stats to game storage
      setStore("Username", userStats.username);
    } else {
      // if user is guest, remove stats from game storage
      removeStore("Username");
    }

    // save stats to game storage
    setStore("Highscore", userStats.highscore);
    setStore("Time", userStats.time);
  }, [userStats]);

  useEffect(() => {
    // get reward pool, leaderboard and best times on page load/user login
    getRewardPool();
    getLeaderboard();
    getBestTimes();

    loadUserStats();
  }, [user]);

  // ---------------------------------- 4 Testing ---------------------------------- Comment before commit 

  // useEffect(() => {
  //   // get reward pool, leaderboard, and best times on page load/user login
  //   getRewardPool();
  //   getLeaderboard();
  //       // Example user for testing in Best Times
  //   const exampleBestTimeUser: BestTimes = {
  //     username: "testuser",
  //     time: 120, // Example time in seconds
  //   };
  //   // Example users for testing in Best Times
  //   const fakeBestTimesData: BestTimes[] = [
  //     {
  //       username: "xvlad",
  //       time: 95, // Example time in seconds
  //     },
  //     {
  //       username: "knowhow92",
  //       time: 120, // Example time in seconds
  //     },
  //     {
  //       username: "arcange",
  //       time: 85, // Example time in seconds
  //     },
  //     {
  //       username: "howdarylrolls",
  //       time: 150, // Example time in seconds
  //     },
  //   ];

  //   setBestTimes(fakeBestTimesData);

  //   // Load the rest of the content
  //   loadUserStats();
  // }, [user]);


  return (
    <Flex
      marginTop={12}
      direction="column"
      align="center"
      justify="center"
      width="100%"
    >

      {userStats.username !== "guest" && isLoggedIn() ? (
        <Flex
          direction="row"
          align="center"
          gap={10}
          marginBottom={10}
        >

          <Flex
            direction="row"
            alignItems="center"
            border={"3px solid green"}
            gap={2}
            borderRadius="md"
            padding={1}
            paddingLeft={2}
            paddingRight={2}
          >
            <Image
              src="assets/coinspin.gif"
              width="30px"
              height="30px"
            />

            <Text
              fontSize="2xl"
            >
              {userStats.highscore.toFixed(0)}
            </Text>
          </Flex>

          <Flex
            direction="row"
            alignItems="center"
            border={"3px solid green"}
            gap={2}
            borderRadius="md"
            padding={1}
            paddingLeft={2}
            paddingRight={2}
          >
            <Image
              src="assets/clockspin.gif"
              width="28px"
              height="28px"
            />

            <Text
              fontSize="2xl"
            >
              {userStats.time > 60 ? (Math.floor(userStats.time / 60) + "m " + (userStats.time % 60) + "s") : (userStats.time + "s")}
            </Text>
          </Flex>

        </Flex>
      ) : (
        <Text
          fontSize="2xl"
          fontWeight="bold"
          marginBottom={10}
        >
          Login to save your stats and compete for rewards!
        </Text>
      )}

      <Box
        padding={2}
        marginBottom={10}
      >
        <iframe width="1280" height="720" style={{ background: "#000000", borderRadius: "20px" }} />
      </Box>

      <Text fontSize="3xl">
        <Link style={{ textDecoration: 'none' }} href={rewardPool?.link || "https://peakd.com/@stoken.quest/"} isExternal>
          {rewardPool?.name || "The Quest For Stoken!"}
        </Link>
      </Text>

      <Flex
        direction="row"
        alignItems="center"
        border={"3px solid green"}
        gap={2}
        borderRadius="md"
        padding={1}
        paddingLeft={2}
        paddingRight={2}
      >
        <Image
          src="assets/coinspin.gif"
          width="30px"
          height="30px"
        />

        <Text
          fontSize="2xl"
        >
          Reward Pool: ${rewardPool?.reward}

        </Text>
      </Flex>

      <Flex
        direction="row"
        justify="space-around"
        align="start"
        width="100%"
        marginTop={10}
        gap={10}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          width="50%"
        >
          <Text
            fontSize="3xl"
            fontWeight="bold"
          >
            Leaderboard
          </Text>
          <Table
            width="100%"
            border="1px solid green"
          >
            <Thead>
              <Tr>
                <Th border="0px">#</Th>
                <Th border="0px">User</Th>
                <Th border="0px">Username</Th>
                <Th border="0px" w="20%" textAlign="center">Highscore</Th> {/* Set width and center align */}
              </Tr>
            </Thead>
            <Tbody>
              {leaderboard.map((user, index) => (
                <Tr key={index} bg={(index + 1) % 2 === 0 ? 'black' : 'rgba(83, 206, 63, 0.3)'} color="white"> {/* Set background color for the row */}
                  <Td border="0px"> {/* Set background color for the cell */}
                    {index + 1}
                  </Td>
                  <Td border="0px"> {/* Set background color for the cell */}
                    <Image
                      src={`https://images.hive.blog/u/${user.username}/avatar`}
                      alt="profile avatar"
                      borderRadius="10px"
                      border="2px solid limegreen"
                      boxSize="35px"
                    />
                  </Td>
                  <Td border="0px"> {/* Set background color for the cell */}
                    <Link style={{ textDecoration: 'none' }} href={"https://skatehive.app/profile/" + user.username} isExternal>
                      @{user.username}
                    </Link>
                  </Td>
                  <Td isNumeric textAlign="center" border="0px"> {/* Set background color for the cell */}
                    {user.highscore.toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>




        </Flex>

        <Flex
          direction="column"
          align="center"
          justify="center"
          width="50%"
        >
          <Text
            fontSize="3xl"
            fontWeight="bold"
          >
            Best Times
          </Text>
          <Table
            bg="black" // Set background color for the entire table
            width="100%"
            border="1px solid green" // Add a border to the table
            borderRadius="10px"
          >
            <Thead>
              <Tr>
                <Th border="none">#</Th>
                <Th border="none">Avatar</Th>
                <Th border="none">Username</Th>
                <Th border="none" w="20%" textAlign="center">Time</Th> {/* Set width and center align */}
              </Tr>
            </Thead>
            <Tbody>
              {bestTimes.map((user, index) => (
                <Tr key={index} bg={(index + 1) % 2 === 0 ? 'black' : 'rgba(83, 206, 63, 0.3)'} color="white"> {/* Set background color for the row */}
                  <Td border="none"> {/* Set background color for the cell */}
                    {index + 1}
                  </Td>
                  <Td border="none"> {/* Set background color for the cell */}
                    <Image
                      src={`https://images.hive.blog/u/${user.username}/avatar`}
                      alt="profile avatar"
                      borderRadius="10px"
                      border="2px solid limegreen"
                      boxSize="35px"
                    />
                  </Td>
                  <Td border="none"> {/* Set background color for the cell */}
                    <Link style={{ textDecoration: 'none' }} href={"https://skatehive.app/profile/" + user.username} isExternal>
                      @{user.username}
                    </Link>
                  </Td>
                  <Td isNumeric textAlign="center" border="none"> {/* Set background color for the cell */}
                    {user.time}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

        </Flex>
      </Flex>

    </Flex>
  );

}
