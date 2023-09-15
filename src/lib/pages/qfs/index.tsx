import { Flex, Text, Image, Button, Box, Table, Thead, Tbody, Tr, Th, Td, Link } from "@chakra-ui/react";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import { useEffect, useState } from "react";
import {
  setStore,
  getStore,
  removeStore,
  getUpdate,
} from "lib/pages/qfs/gamestore";

const API = "http://localhost:3000/";

export default function QFS() {
  
  const { user } = useAuthUser();
  const { isLoggedIn } = useAuthUser();

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

  const [userStats, setUserStats] = useState<UserStats>({username: "guest", highscore: 0, time: 0});
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [bestTimes, setBestTimes] = useState<BestTimes[]>([]);
  const [rewardPool, setRewardPool] = useState<RewardPool>();

  const getLeaderboard = async () => {
    const response = await fetch(API + "leaderboard");
    const data = await response.json();
    setLeaderboard(data);
  };

  const getBestTimes = async () => {
    const response = await fetch(API + "times");
    const data = await response.json();
    setBestTimes(data);
  };

  const getRewardPool = async () => {
    const response = await fetch(API + "rewardpool");
    const data = await response.json();

    const { post } = data;

    const pendingPayout = parseFloat(post.pending_payout_value.split(' ')[0]) / 2;
    const reward = (pendingPayout / 2).toFixed(3);

    const isVoted = post.active_votes.some((vote: any) => vote.voter === user?.name);

    setRewardPool({
      name: post.title,
      link: `https://peakd.com/@${post.author}/${post.permlink}`,
      reward,
      isVoted
    });
  };

  const loadUserStats = async () => {
    if (!user?.name) {
      loadGame();
      return;
    }

    const response = await fetch(API + "getuser/" + user?.name);
    const data = await response.json();
    setUserStats({
      username: data.username,
      highscore: data.highscore,
      time: data.time,
    });

    window.addEventListener('storage', async () => {
      const update = getUpdate();

      if (!update) {
        return;
      } else {
        removeStore("Update");
        await pushStats();
      }
    });

    window.dispatchEvent(new Event('storage'));

    loadGame();
  };

  // load game iframe
  const loadGame = () => {
    const game = document.querySelector("iframe");
    game?.setAttribute("src", "QFS/game.html");
  };

  const pushStats = async () => {

    const username = getStore("Username") || "guest";
    const highscore = getStore("Highscore") || 0;
    const time = getStore("Time") || 0;

    if (username === "guest") {
      return;
    }

    // post user stats to API
    await fetch(API + "pushscore", {
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
      time: time ? parseInt(time) : 0 ,
    });

    // update leaderboard and best times
    getLeaderboard();
    getBestTimes();
  };

  useEffect(() => {
    getRewardPool();
    getLeaderboard();
    getBestTimes();

    loadUserStats();
  }, [user]);

  useEffect(() => {
    if (userStats.username !== "guest") {
      setStore("Username", userStats.username);
    } else {
      removeStore("Username");
    }
    setStore("Highscore", userStats.highscore);
    setStore("Time", userStats.time);
  }, [userStats]);

  useEffect(() => {
    
  }, []);


  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      width="100%"
    >

      {userStats.username !== "guest" && isLoggedIn() ? (
      <Flex
        direction="row"
        align="center"
        gap={ 10 }
        marginBottom={ 10 }
      >

        <Flex
          direction="row"
          alignItems="center"
          border={ "3px solid green" }
          gap={ 2 }
          borderRadius="md"
          padding={ 1 }
          paddingLeft={ 2 }
          paddingRight={ 2 }
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
          border={ "3px solid green" }
          gap={ 2 }
          borderRadius="md"
          padding={ 1 }
          paddingLeft={ 2 }
          paddingRight={ 2 }
        >
          <Image
            src="assets/clockspin.gif"
            width="28px"
            height="28px"
          />

          <Text
            fontSize="2xl"
          >
            {userStats.time > 60 ? (Math.floor (userStats.time / 60) + "m " + (userStats.time % 60) + "s") : (userStats.time + "s")}
          </Text>
        </Flex>

      </Flex>
      ) : (
        <Text
          fontSize="2xl"
          fontWeight="bold"
          marginBottom={ 10 }
        >
          Login to save your stats!
        </Text>
      )}

      <Box
        border={ "3px dotted green" }
        borderRadius="3xl"
        padding={ 2 }
        marginBottom={ 10 }
      >
      <iframe width="1280" height="720" style={{background: "#000000"}} />
      </Box>

      <Text fontSize="3xl">{rewardPool?.name || "The Quest For Stoken!"}</Text>
      <Text marginBottom={ 5}>
        <Link style={{textDecoration: 'none'}} href={rewardPool?.link || "https://peakd.com/@stoken.quest/"} isExternal>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
            <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
          </svg>
        </Link>
      </Text>

      <Flex
        direction="row"
        alignItems="center"
        border={ "3px solid green" }
        gap={ 2 }
        borderRadius="md"
        padding={ 1 }
        paddingLeft={ 2 }
        paddingRight={ 2 }
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
        marginTop={ 10 }
        gap={ 10 }
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
            variant="striped"
            colorScheme="green"
            width="100%"
          >
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Username</Th>
                <Th>Highscore</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaderboard.map((user, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Link style={{textDecoration: 'none'}} href={"https://peakd.com/@" + user.username} isExternal>
                    @{user.username}
                    </Link>
                  </Td>
                  <Td isNumeric>{user.highscore}</Td>
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
            variant="striped"
            colorScheme="green"
            width="100%"
          >
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Username</Th>
                <Th>Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bestTimes.map((user, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Link style={{textDecoration: 'none'}} href={"https://peakd.com/@" + user.username} isExternal>
                    @{user.username}
                    </Link>
                  </Td>
                  <Td isNumeric>{user.time}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      </Flex>
      
    </Flex>
  );

}
