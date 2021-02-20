import logo from "./logo.svg";
import "./App.css";
import { TextField, Button, makeStyles } from "@material-ui/core";
import Panel from "./components/Panel";
import { useState, useEffect } from "react";
import axios from "axios";
const useStyles = makeStyles({
  root: {},
  header: {
    height: "5vh",
  },
  bottom: {
    height: "5vh",
  },
});

function App() {
  const classes = useStyles();
  const [connect, setConnect] = useState(false);
  const [user, setUser] = useState("Edward1613790337990");
  const [chatServer, setChatServer] = useState(
    "https://chat-room-be.herokuapp.com"
  );
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const handleConnect = () => {
    setConnect(!connect);
  };

  const getMessages = async () => {
    await axios.get(chatServer + "/message");
  };
  const postMessage = async () => {
    await axios.post(chatServer + "/message", {
      user: user,
      message: message,
    });
  };

  useEffect(() => {
    const sse = new EventSource(chatServer + "/message", {
      withCredentials: true,
    });
    function getRealtimeData(data) {
      // process the data here,
      // then pass it to state to be rendered
      console.log(data);
    }
    sse.onmessage = (e) => getRealtimeData(JSON.parse(e.data));
    sse.onerror = () => {
      // error log here

      sse.close();
    };
    return () => {
      sse.close();
    };
  }, [connect]);

  let chatComponents = "";
  if (connect) {
    chatComponents = (
      <>
        <Panel messages={messages} />
        <div className={classes.bottom}>
          <TextField id="outlined-basic" label="Message" variant="outlined" />
          <Button variant="contained">Send</Button>
        </div>
      </>
    );
  }

  return (
    <div className="App">
      <div className={classes.header}>
        <TextField
          id="outlined-basic"
          label="User"
          variant="outlined"
          value={user}
        />
        <TextField
          id="outlined-basic"
          label="Chat-server"
          variant="outlined"
          value={chatServer}
        />
        <Button variant="contained" onClick={handleConnect}>
          {connect ? "Disconnect" : "Connect"}
        </Button>
      </div>
      {chatComponents}
    </div>
  );
}

export default App;
