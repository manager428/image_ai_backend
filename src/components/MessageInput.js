import React, {useState, useEffect, useRef} from "react";
import sendMessageIcon from '../assets/icon/send-message-icon.svg';
import micIcon from '../assets/icon/mic-icon3.svg';
import micIconBlock from '../assets/icon/mic-icon-block.svg';

const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition(); // prefix 必要 SpeechRecognition
recognition.lang = "ja-JP";
recognition.continuous = true;
recognition.interimResults = true;

export default ({send, setStateSpeech, imgRef}) => {

	const [typing, setTyping] = useState(false);
	const [input, setInput] = useState('');

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

	// useEffect(() => {
	// 	if (messages.length == 0) return;
	// 	const message = messages[messages.length - 1];
	// 	if (message.type == "a") {
	// 	createAudio(message.text, {
	// 		speaker: 2,
	// 		pitch: 0.5,
	// 		intonation: 1.2,
	// 		otoya: 0.8,
	// 		speed: 1.5,
	// 	});
	// 	}
	// }, [messages]);

	useEffect(() => {
		setTimeout(() => {
			recognition.stop();
		}, 0);

		setTimeout(() => {
			processChat(transcript);
		}, 0);
	}, [transcript]);

	// useEffect(() => {
	// 	if (!loading) {
	// 	// To run in next cycle.
	// 		setTimeout(() => {
	// 			// messageInputRef.current.focus();
	// 		}, 0);
	// 	}
	// }, [loading]);

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

	const startSpeech = async () => {
		setPlayState(false);
		setStartState(true);

		recognition.start();
		
	};

	const stopSpeech = () => {
		setPlayState(true);
		setStartState(false);
		recognition.stop();

		setStateSpeech(false)
	};

	const processChat = async (text) => {
		
		if (!text) {
			return;
		}
		setPlayState(true);
		send(text);
	};



	const createAudio = async (text, options) => {

		imgRef.current.src = "./assets/charactor/saying.gif";
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = japaneseVoice;
		utterance.rate = speed; // controls the speed, 1 is normal speed
		utterance.pitch = 1; // controls the pitch, 1 is normal pitch

		utterance.addEventListener("end", async () => {

			setPlayState(false);
			await recognition.start();

			setStateSpeech(false)
		});

		speechSynthesis.speak(utterance);

	};

	const sendMessage = () => {
		send(input);
		setInput("");
	};

	const pressKey = (e) => {
		if (e.keyCode == 13) {
			sendMessage();
		}
	};

	useEffect(() => {
		if(input === "") {
			setTyping(false);
		} else {
			setTyping(true);
		}
	}, [input]);

	return (
		<div className="messageInput">
			<input
				type="text"
				value={input}
				onKeyDown={(e) => pressKey(e)}
				onChange={(e) => setInput(e.target.value)}
			/>
				{typing?
					<img
						src={sendMessageIcon}
						onClick={() => sendMessage()}
					/>
				:
				<>
					<div onClick={() => startSpeech()}>
						<img src={micIcon} />
					</div>
					<div onClick={() => stopSpeech()}>
						<img src={micIconBlock} />
					</div>
				</>
				}
		</div>
	)
}