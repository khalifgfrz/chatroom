import { useState, useEffect } from "react";
import moment from "moment";
import Swal from "sweetalert2";

const ws = new WebSocket(`${import.meta.env.VITE_REACT_APP_CABLE_URL}/cable`);

function App() {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  ws.onopen = () => {
    console.log("Connected to websocket server");

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          channel: "MessagesChannel",
        }),
      })
    );
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "ping" || data.type === "welcome" || data.type === "confirm_subscription") return;

    const message = data.message;
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value.trim();
    if (!body) {
      Swal.fire({
        title: "Error!",
        text: "Message cannot be empty!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#fff",
        color: "#0B0909",
        customClass: {
          popup: "text-sm rounded-lg shadow-lg mt-8",
        },
        toast: true,
      });
      return;
    }
    e.target.message.value = "";
    setLoadingSend(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) throw new Error("Failed to send message");
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something Went Wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#fff",
        color: "#0B0909",
        customClass: {
          popup: "text-sm rounded-lg shadow-lg mt-8",
        },
        toast: true,
      });
      console.error(error);
    } finally {
      setLoadingSend(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    setFetchError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="h-screen px-5 tbt:px-20">
      <h1 className="mt-10 w-full text-center text-2xl font-bold">Chatroom</h1>

      <div className="h-[60%] my-10 overflow-y-scroll mx-auto">
        {fetchError ? (
          <div className="flex h-full font-medium self-center items-center justify-center my-5 py-2 px-3">
            <p className="text-2xl md:text-4xl">Something went wrong</p>
          </div>
        ) : loadingMessages ? (
          <div className="flex h-full font-medium self-center items-center justify-center my-5 py-2 px-3">
            <p className="text-2xl md:text-4xl">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full font-medium self-center items-center justify-center my-5 py-2 px-3">
            <p className="text-2xl md:text-4xl">Start Your Message Here</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="font-medium bg-[#4caf50] w-1/2 rounded-lg my-5 py-2 px-3">
              <p className="text-white">{message.body}</p>
              <p className="text-right text-xs text-gray-700">{moment(message.created_at).format("MMM D YYYY")}</p>
            </div>
          ))
        )}
      </div>

      <div className="h-[10%] w-full">
        <form onSubmit={handleSubmit} className="flex gap-5">
          <input className="w-full px-5 bg-gray-500 text-white" placeholder="type your message here" type="text" name="message" />
          <button className="border-2 border-[#4caf50] py-1 px-2 bg-[#4caf50] text-white text-lg cursor-pointer rounded-lg" type="submit" disabled={loadingSend}>
            {loadingSend ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
