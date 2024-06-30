import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";
import Peer from "peerjs";

window.peer = new Peer();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const peerId = urlParams.get('peerId');
console.log('URL peer ID is: ' + peerId);

const container = document.getElementById("root");
const root = createRoot(container);

if (peerId) {
  window.peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
  });
  
  container.innerText = "Conectando...";

  setTimeout(() => {
    window.conn = window.peer.connect(peerId);
  }, 2000);
  setTimeout(() => {
    container.innerText = "";
    root.render(
      <StrictMode>
        <App peer={window.peer} localConn={window.conn} />
      </StrictMode>
    );
  }, 4000);
} else {

  root.render(
    <StrictMode>
      <App peer={window.peer} />
    </StrictMode>
  );
}



// const root = createRoot(document.getElementById("root"));
// root.render(
//   <StrictMode>
//     <App peer={peer} />
//   </StrictMode>
// );