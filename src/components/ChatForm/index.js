import { AudioOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Select, Image } from "antd";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessage } from "../../actions/chatActions";

const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition(); // prefix 必要 SpeechRecognition
recognition.lang = "ja-JP";
recognition.continuous = true;
recognition.interimResults = true;

const ChatForm = () => {
  // const messageInputRef = useRef(null);
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, messages } = useSelector((state) => state.chat);
  let [playState, setPlayState] = useState(true);
  let [startState, setStartState] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [japaneseVoice, setJapaneseVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoice = voices.find((voice) => voice.lang === "ja-JP");
      setJapaneseVoice(japaneseVoice);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (messages.length == 0) return;
    const message = messages[messages.length - 1];
    if (message.type == "a") {
      createAudio(message.text, {
        speaker: 2,
        pitch: 0.5,
        intonation: 1.2,
        otoya: 0.8,
        speed: 1.5,
      });
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      recognition.stop();
    }, 0);

    setTimeout(() => {
      processChat(transcript);
    }, 0);
  }, [transcript]);

  useEffect(() => {
    if (!loading) {
      // To run in next cycle.
      setTimeout(() => {
        // messageInputRef.current.focus();
      }, 0);
    }
  }, [loading]);

  recognition.onend = (event) => {
    if (startState && !playState) {
      setTimeout(() => {
        recognition.start();
      }, 500);
    }
  };
  recognition.onstart = (event) => {
    
    setTranscript("");
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    

    if (!finalTranscript) return;
    
    setTranscript(finalTranscript);
  };

  const startChat = async () => {
    setPlayState(false);
    setStartState(true);

    recognition.start();
    
  };

  const stopChat = () => {
    setPlayState(true);
    setStartState(false);
    recognition.stop();

    imgRef.current.src = "/avatar2.gif";
  };

  const processChat = async (text) => {
    
    if (!text) {
      return;
    }
    setPlayState(true);
    const response = fetchMessage(text);

    dispatch(response);
    // chatForm.resetFields();
  };

  

  const createAudio = async (text, options) => {

    imgRef.current.src = "/avatar1.gif";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = japaneseVoice;
    utterance.rate = speed; // controls the speed, 1 is normal speed
    utterance.pitch = 1; // controls the pitch, 1 is normal pitch

    utterance.addEventListener("end", async () => {

      setPlayState(false);
      await recognition.start();

      imgRef.current.src = "/avatar2.gif";
    });

    speechSynthesis.speak(utterance);

  };



  const handleSpeedChange = (value) => {
    console.log(value);
    setSpeed(value);
  };

  return (
    <>
      <Row style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          // width={'100%'}
          // height={'90%'}
          ref={imgRef}
          src="/avatar2.gif"
        />
      </Row>
      <Row>
        <Col span={2}></Col>
        <Col span={8}>
          <Select
            defaultValue={speed}
            style={{ width: 120 }}
            onChange={handleSpeedChange}
            options={[
              {
                value: "0.8",
                label: "初心者",
              },
              {
                value: "1",
                label: "普通",
              },
              {
                value: "1.2",
                label: "エキスパート",
              },
            ]}
          />
        </Col>
        <Col span={4}>
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={startChat}
            disabled={startState}
          >
            Start
          </Button>
        </Col>
        <Col span={4}>
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={stopChat}
            disabled={!startState}
          >
            Stop
          </Button>
        </Col>
        <Col span={4}>
          <Button type="primary" size="large" shape="circle" disabled={playState}>
            <AudioOutlined />
          </Button>
        </Col>
        <Col span={2}></Col>
      </Row>
    </>
  );
};
export default ChatForm;
