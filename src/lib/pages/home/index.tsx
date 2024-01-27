import {
  Flex,
} from '@chakra-ui/react';
import HiveBlog from './Feed/Feed';
import Chat from './chat';
import Plaza from '../plaza';

const isMobile = window.innerWidth <= 768; // Adjust the width as needed


const Home = () => {
  // const navigate = useNavigate();
  // const { selectedIndex, ...tabProps } = useTabs({ isLazy: true });


  return (
    <Flex direction="column">
      {isMobile ? <Plaza /> : <HiveBlog />}
      <Chat />
    </Flex>
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

