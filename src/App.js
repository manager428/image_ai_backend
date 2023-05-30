import React, { useState, useRef } from 'react';
import stopCharactor from './assets/charactor/stop.gif';
import speechCharactor from './assets/charactor/saying.gif';
import './App.css';
import MessageInput from './components/MessageInput';
import MessageBox from './components/MessageBox';

const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function useChatScroll(dep) {
  const ref = React.useRef();
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  });
  
  return ref;
}

function App() {
  const imgRef = useRef(null);
  const [stateSpeech, setStateSpeech] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Let's have a short conversation in everyday and simple sentences in English. You are a 20 year old USA girl. If I speak to you in English, please speak to me only in Englush. Less than 500 characters. I like short answers.",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);

  const [audioText, setAudioText] = useState()

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setStateSpeech(ture);
      setTimoeout(() => {
        setStateSpeech(false);
      }, data.choices[0].message.content.length)
      // setAudioText(data.choices[0].message.content);
    });
  }

  const [scroll , setScroll] = React.useState([])
  const ref = useChatScroll(scroll)
  
  return (
    <div className="back">

      <div className="container">
        <div className="wrap">
          <div className='image'>
            {stateSpeech?
              <img
                src={speechCharactor}
              />
              :
              <img
                src={stopCharactor}
              />
            }
          </div>
          <div className="chatScreen">
            <div className="messageList" ref={ref}>
              {messages.slice(1).map((message, index) => (
                <MessageBox key={index} element={message} />
              ))}
            </div>
            <MessageInput send={handleSend} setStateSpeech={setStateSpeech} imgRef={imgRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
