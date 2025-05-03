import React, { useEffect, useState } from 'react'
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser"
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from 'stream-chat';
import { toast } from "react-hot-toast"
import ChatLoader from '../components/ChatLoader';
import CallButton from '../components/CallButton';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {

  // get the id from URL "/chat/:id"
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser  // do not run this query unless we have the authUser. !! converts it into Boolean
  })

  useEffect(() => {
    console.log("Start of useEffect")

    const initChat = async () => {
      if(!tokenData?.token || !authUser) return; 

      try {
        console.log("Initializing Stream Chat Client");

        // initialize client
        console.log("before getInstance");
        console.log("stream api key: ", STREAM_API_KEY)
        const client = StreamChat.getInstance(STREAM_API_KEY);
        console.log("after getInstance")


        // connect user
        console.log("Before connectUser")
        console.log(tokenData.token);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        console.log("After connectUser")
        
        // create chat channel ID
        console.log("Before channelId")
        const channelId = [authUser._id, targetUserId].sort().join("-");
        console.log("After channelId")

        /* 
          Why are we sorting IDs?
        1) if i start the chat => channelId: [myId, yourId]
        2) if you start the chat => channelId: [yourId, myId]  => [myId,yourId]
        3) They are not same, so a different chat channel is created, which we dont want.
        4) So sorting ensures we keep it the same every time.
        */
      
        // create chat channel 
        console.log('Before currChannel')
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId]
        })
        console.log('After currChannel')

        // listen for incoming changes
        console.log("Before currChannel")
        await currChannel.watch();
        console.log("After currChannel")
        
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `Let's do a video call. Join here: ${callUrl}`
      });

      toast.success("Video Call link sent successfully!");
    }
  }

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage