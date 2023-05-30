import { useEffect } from 'react'
import ask from '../assets/ask2.jpg';
import answer from '../assets/answer2.jpg';



export default ({element}) => {

    return (
        <div className="conversation">
            {element.sender === 'user'?
                <div className="question">
                    <p>{element.message}</p>
                    <img src={ask} />
                </div>
            :
                <div className="answer">
                    <img src={answer} />
                    <p>{element.message}</p>
                    <video controls={true} autoPlay={true} typeof='media' style={{display: "flex", height: "30px", color: "#333333"}}>
                        <source src={`https://www.yukumo.net/api/v2/aqtk1/koe.mp3?type=f1&amp;effect=none&amp;boyomi=true&amp;speed=100&amp;volume=100&amp;kanji='${element.message}'`} type="audio/mpeg" />
                    </video>
                </div>
            }
        </div>
    )
} 