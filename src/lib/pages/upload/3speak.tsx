import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Text, Image, Link, Input } from "@chakra-ui/react";
import { KeychainSDK } from 'keychain-sdk';
import useAuthUser from "lib/pages/home/api/useAuthUser";
import axios from "axios";
import getBlobDuration from 'get-blob-duration';

// import tus for 3speak implementation
import * as tus from "tus-js-client";

declare global {
  interface Window {
    hive_keychain: any;
  }
}

// 3speak connection status interface
interface AuthStatus {
  connected: boolean;
  username: string | null;
}

// 3speak connection status object function 
export const get3SpeakAuthStatus = (): AuthStatus => {
  const username = localStorage.getItem("3SpeakUser");
  const connected = localStorage.getItem("3SpeakToken") ? true : false;
  const { user } = useAuthUser() as any;

  // if user is the same as 3speak user and jwt is valid, then return connected true
  return {
    connected: connected && user && username === user.name,
    username: username
  }
}

export const Connect3Speak = () => {
  const [connected, setConnected] = useState(false)
  const { user } = useAuthUser() as any;

  const connect = async () => {

    // check if user is logged in
    if (!user) {
      alert("Please login first");
      return;
    }

    // if 3Speak is already connected with the same user, then return otherwise continue
    if (connected && localStorage.getItem("3SpeakUser") === user.name) {
      return;
    } else {
      setConnected(false);
    }

    const LOGIN_URL = `https://studio.3speak.tv/mobile/login?username=${user.name}`;
    
    // returns a encoded memo which is used to login to 3speak
    const response = await axios.get(LOGIN_URL);
    const { data } = response;
    const { memo } = data;

    if (typeof window === "undefined" || !(window as any).hive_keychain) {
      alert("Please install Hive Keychain first");
      // window.location.href = "/tutorial";
      return;
    }

    // decode the memo via keychain
    window.hive_keychain.requestVerifyKey(
      user.name,
      memo,
      "Posting",
      async (response: any) => {
        if (response.success) {
          // get jwt and remove # from the start
          const jwt = response.result.replace("#", "");

          // store the jwt in localstorage
          localStorage.setItem("3SpeakUser", user.name);
          localStorage.setItem("3SpeakToken", jwt);

          // set the connected state
          setConnected(true);

        } else {
          alert("Something went wrong while connecting to 3Speak. Please try again.");
        }
      }
    );
    
  }

  const onStart = () => {
    // check if user is logged in
    if (!user) {
      setConnected(false);
      return;
    }

    // if 3Speak is already connected with the same user, then set connected to true otherwise false
    if (localStorage.getItem("3SpeakUser") === user.name && localStorage.getItem("3SpeakToken")) {
      setConnected(true);
    } else {
      setConnected(false);
    }

    // if connected, get all the videos from user on 3speak to verify if jwt is still valid
    // if (connected) {
    //   const GET_VIDEOS_URL = `https://studio.3speak.tv/mobile/api/my-videos`;
    //   const jwt = localStorage.getItem("3SpeakToken");

    //   // axios get request with jwt in Authorization header
    //   axios.get(GET_VIDEOS_URL, {
    //     headers: {
    //       Authorization: `Bearer ${jwt}`
    //     }
    //   }).then((response) => {

    //     const { data } = response;
    //     console.log(data);

    //   }).catch((error) => {
    //     // if jwt is invalid, then set connected to false
    //     setConnected(false);
    //   });
    // }
  }

  useEffect(() => {
    onStart();
  }, [user]);

  return (
    <Box>
      <Button onClick={connect} colorScheme={connected ? 'green' : 'teal'} size="sm" marginTop={2} marginRight={2}>
        {connected ? '3Speak Connected' : 'Connect 3Speak'}
      </Button>
    </Box>
    
  )
};

export const uploadTo3Speak = async (file: File, setIsUploading: Function, setVideoUploadProgress: Function, setVideoInfo: Function, setIsVideoUploaded: Function) => {
  const UPLOAD_URL = `https://uploads.3speak.tv/files`;

  // get duration of video
  let duration = 0;
  duration = await getBlobDuration(file);

  // upload via tus
  const upload = new tus.Upload(file, {
    endpoint: UPLOAD_URL,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filename: file.name,
      filetype: file.type
    },
    onError: function(error) {
      console.log("Failed because: " + error);
      setIsUploading(false);
      setIsVideoUploaded(false);
    },
    onProgress: function(bytesUploaded, bytesTotal) {
      const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      console.log(bytesUploaded, bytesTotal, percentage + "%");
      setVideoUploadProgress(percentage);
    },
    onSuccess: function() {
      setIsUploading(false);
      const name = upload.url?.replace('https://uploads.3speak.tv/files/', '');
      const videoInfo = {
        'filename': name,
        'oFilename': file.name,
        'size': file.size,
        'duration': duration,
        'thumbnail': '',
        'owner': localStorage.getItem("3SpeakUser"),
      }

      console.log(videoInfo);

      setVideoInfo(videoInfo);
      setIsVideoUploaded(true);
    }
  });

  // start the upload
  upload.start();

  return upload;
};

export const uploadThumbnailTo3Speak = (file: File, setIsUploading: Function, videoInfo: {}, setVideoInfo: Function) => {
  const UPLOAD_URL = `https://uploads.3speak.tv/files`;

  // upload via tus
  const upload = new tus.Upload(file, {
    endpoint: UPLOAD_URL,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filename: file.name,
      filetype: file.type
    },
    onError: function(error) {
      console.log("Failed because: " + error);
      setIsUploading(false);
    },
    onProgress: function(bytesUploaded, bytesTotal) {
      const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      console.log(bytesUploaded, bytesTotal, percentage + "%");
    },
    onSuccess: function() {
      setIsUploading(false);
      const name = upload.url?.replace('https://uploads.3speak.tv/files/', '');

      setVideoInfo({
        ...videoInfo,
        thumbnail: name
      });

      console.log({
        ...videoInfo,
        thumbnail: name
      });
    }
  });

  // start the upload
  upload.start();

  return upload;
}

export const setVideoInfoOn3Speak = async (videoInfo: {}) => {
  const SET_VIDEO_INFO_URL = `https://studio.3speak.tv/mobile/api/upload_info?app=skatehive`;

  const jwt = localStorage.getItem("3SpeakToken");

  // axios get request with jwt in Authorization header
  const response = await axios.post(SET_VIDEO_INFO_URL, videoInfo, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });

  return response.data;
}