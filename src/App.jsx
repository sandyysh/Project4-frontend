import React, {useState} from 'react';
import {StreamChat} from 'stream-chat';
import {ChannelActionProvider, ChannelList, Chat, VirtualizedMessageList} from 'stream-chat-react';
import Cookies from 'universal-cookie';
import { ChannelListContainer, ChannelContainer, Auth } from './components';
import './App.css';
import 'stream-chat-react/dist/css/index.css';

const cookies = new Cookies(); 

const apiKey = 'm6587zd4cc6h'
const authToken = cookies.get('token');

const client = StreamChat.getInstance(apiKey);
console.log(typeof client)

if (authToken) {

  client.connectUser({
    id: cookies.get('userId'),
    name: cookies.get('username'),
    fullName: cookies.get('fullName'),
    phoneNumber: cookies.get('phoneNumber'),
    image: cookies.get('avatarURL'),
    hashedPassword: cookies.get('hashedPassword'), 
  }, authToken)
  
  const filter = { cid: "livestream:default"} ;
  const sort = {}
  
  
  const globalChannel = await client.queryChannels(filter, sort, {
                watch: true, // this is the default
                state: true,
  });
    //alert(JSON.stringify(channels));
    globalChannel.map((channel) => {
      //alert(JSON.stringify(channel));
      //alert(JSON.stringify(cookies.get('userId')));
      //client.partialUpdateUsers([{id:  cookies.get('userId'), set: {teams: [channel.id]}])

      //channel.assignRoles([{user_id: cookies.get('userId'), channel_role:"channel_member"}])
      channel.addMembers([cookies.get('userId')]);
    });
        

  }




const App = () => {
  const [createType, setCreateType] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  if(!authToken) return <Auth />

  return (
    <div className='app__wrapper'>
        <Chat client = {client} theme='team light'>
            <ChannelListContainer
              isCreating = {isCreating}
              setIsCreating={setIsCreating}
              setIsEditing={setIsEditing}
              setCreateType={setCreateType}
            />
            <ChannelContainer
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              createType={createType}
            />
        </Chat>
    </div>
  )
}

export default App
