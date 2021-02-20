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
    display: "flex",
    justifyContent: "center",
    alignContent: "center"
  },
});

function App() {
  const classes = useStyles();
  const [connect, setConnect] = useState(false);
  const [user, setUser] = useState("edward");
  const [chatServer, setChatServer] = useState("http://localhost:5000");
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
    setMessage("");
  };

  useEffect(() => {
    const sse = new EventSource(chatServer + "/message", {
      withCredentials: false,
    });
    function getRealtimeData(data) {
      // process the data here,
      // then pass it to state to be rendered
      console.log(data);
      setMessages([...messages, data])
    }
    sse.onmessage = (e) => getRealtimeData(JSON.parse(e.data));
    sse.onerror = () => {
      // error log here
      console.log("Any error on sse")
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, []);

  let chatComponents = "";
  if (connect) {
    chatComponents = (
      <>
        <Panel messages={messages} />
        <div className={classes.bottom}>
          <TextField
            id="outlined-basic"
            label="Message"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={postMessage}>
            Send
          </Button>
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
          onChange={(e) => setUser(e.target.value)}
        />
        <TextField
          id="outlined-basic"
          label="Chat-server"
          variant="outlined"
          value={chatServer}
          onChange={(e) => setChatServer(e.target.value)}
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
