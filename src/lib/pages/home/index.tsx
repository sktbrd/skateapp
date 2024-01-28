import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import Chat from './chat';
import Plaza from './plaza';
import { useMediaQuery } from '@chakra-ui/react';
const isMobile = window.innerWidth <= 768; // Adjust the width as needed


const Home = () => {
  // const navigate = useNavigate();
  // const { selectedIndex, ...tabProps } = useTabs({ isLazy: true });
  const isBigScreen = useMediaQuery("(min-width: 768px)")


  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
    >

      <Tabs isFitted variant="enclosed" width="100%" color={"black"} >
        <TabList justifyContent={"center"} width="100%" color={"black"} >
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'blue.200',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Surf
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'green.400',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',

            }}
          >
            Skate

          </Tab>

          <Tab
            color="white"
            _selected={{
              backgroundColor: 'purple.400',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white'

            }}
          >
            Long
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Snow
          </Tab>
          <Tab
            color="white"
            _selected={{
              backgroundColor: 'red',
              color: 'black',
              fontWeight: 'bold',
              border: '1px solid white',
            }}
          >
            Graffiti
          </Tab>

        </TabList>
        <TabPanels>
          {/* skatehive */}
          <TabPanel>
            <HiveBlog tag='hive-141964' />
          </TabPanel>

          <TabPanel>
            <HiveBlog />
          </TabPanel>
          {/* longboard hive */}
          <TabPanel>
            <HiveBlog tag='longboard' />
          </TabPanel>
          <TabPanel>
            <HiveBlog tag='hive-141964' />
          </TabPanel>
          <TabPanel>
            <HiveBlog tag='hive-149133' />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {isBigScreen && <Chat />} {/* Render Chat component only on big screens */}
    </Flex >
  );
};

export default Home;







{/* <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '10px',
        marginTop: '5px'
      }}>
        <img src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23uQ3d5BKcoYkuYWd7kZrnS396M1M6DvsMa5MowAmaVynQr67ChnARGaFstnMGeSspzwR.png" alt="Skatehive Image" style={{ width: '100%' }} />
      </div> */}


{/* <Tabs
        isFitted
        variant="solid-rounded"
        justifyContent="center"
        {...tabProps}
        index={selectedIndex}
        onChange={handleChangeTab}
      >
        <Center>
          <TabList display="flex" width="85%">
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              📜 FEED
            </Tab>
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              🛹 UPLOAD
            </Tab>
            <Tab
              color="lightgreen"
              background="linear-gradient(0deg, black, darkgreen, black)"
              _selected={{
                background: 'linear-gradient(0deg, black, limegreen, black)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
              }}
            >
              🗣 Plaza
            </Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '10px',
              marginTop: '5px'
            }}>
              <img src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/23uQ3d5BKcoYkuYWd7kZrnS396M1M6DvsMa5MowAmaVynQr67ChnARGaFstnMGeSspzwR.png" alt="Skatehive Image" style={{ width: '100%' }} />
            </div>

            {/* Content for Feed tab */}
{/* <HiveBlog />
          </TabPanel>
          <TabPanel> */}
{/* Content for Upload tab */ }
{/* <UploadPage />
          </TabPanel>
          <TabPanel> */}
{/* Content for Plaza tab */ }
{/* <Plaza /> */ }
{/* </TabPanel> */ }
{/* </TabPanels>
      </Tabs> */}

