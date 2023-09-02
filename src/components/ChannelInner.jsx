import React, { useState } from 'react';
import { MessageList, MessageInput, Thread, Window, useChannelActionContext, Avatar, useChannelStateContext, useChatContext } from 'stream-chat-react';
import axios from 'axios';
import { ChannelInfo } from '../assets';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const GiphyContext = React.createContext({});

const ChannelInner = ({ setIsEditing }) => {
  
const [giphyState, setGiphyState] = useState(false);
  const { sendMessage } = useChannelActionContext();
  const { channel } = useChannelStateContext(); 
  const members = channel.state.members;
  

  
  const sendTwilioNotification = async (message) => {
    try {
      console.log('sending twilio notification')
     

      const response = await axios.post('https://tender-bathing-suit-seal.cyclic.cloud/send-twilio-notification', {
    
        type: "message.new",
        user: {id: cookies.get('userId'), fullName: cookies.get('fullName')}, // Assuming you have the sender information
        members,
      });
      console.log(response.data); // 'Message sending process completed.'
    } catch (error) {
      console.error('Error sending Twilio notification:', error);
    }
  };

  const overrideSubmitHandler = (message) => {
    console.log(message);
    
    let updatedMessage = {
      attachments: message.attachments,
      mentioned_users: message.mentioned_users,
      parent_id: message.parent?.id,
      parent: message.parent,
      text: message.text,
    };
    // backend api not called
    if (giphyState) {
      updatedMessage = { ...updatedMessage, text: `/giphy ${message.text}` };
    }
    
    if (sendMessage) {
      sendMessage(updatedMessage);
      console.log('Calling sendTwilioNotification...');
      sendTwilioNotification(updatedMessage.text);
      setGiphyState(false);
    }
  };

  return (
    <GiphyContext.Provider value={{ giphyState, setGiphyState }}>
      <div style={{ display: 'flex', width: '100%' }}>
        <Window>
          <TeamChannelHeader setIsEditing={setIsEditing} />
          <MessageList />
          <MessageInput overrideSubmitHandler={overrideSubmitHandler} />
        </Window>
        <Thread />
      </div>
    </GiphyContext.Provider>
  );
};

const TeamChannelHeader = ({ setIsEditing }) => {
    const { channel, watcher_count } = useChannelStateContext();
    const { client } = useChatContext();
  
    const MessagingHeader = () => {
      const members = Object.values(channel.state.members).filter(({ user }) => user.id !== client.userID);
      const additionalMembers = members.length - 3;
  
      if(channel.type === 'messaging') {
        return (
          <div className='team-channel-header__name-wrapper'>
            {members.map(({ user }, i) => (
              <div key={i} className='team-channel-header__name-multi'>
                <Avatar image={user.image} name={user.fullName || user.id} size={32} />
                <p className='team-channel-header__name user'>{user.fullName || user.id}</p>
              </div>
            ))}
  
            {additionalMembers > 0 && <p className='team-channel-header__name user'>and {additionalMembers} more</p>}
          </div>
        );
      }
  
      return (
        <div className='team-channel-header__channel-wrapper'>
          <p className='team-channel-header__name'># {channel.data.name}</p>
           <span style={{ display: 'flex' }} onClick={() => setIsEditing(true)}> 
            <ChannelInfo /> 
          </span> 
        </div>
      );
    };
  
    const getWatcherText = (watchers) => {
      if (!watchers) return 'No users online';
      if (watchers === 1) return '1 user online';
      return `${watchers} users online`;
    };
  
    return (
      <div className='team-channel-header__container'>
        <MessagingHeader />
        <div className='team-channel-header__right'>
          <p className='team-channel-header__right-text'>{getWatcherText(watcher_count)}</p>
        </div>
      </div>
    );

  };

  export default ChannelInner;