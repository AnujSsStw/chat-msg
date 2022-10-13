import {
  DetailedHTMLProps,
  HTMLAttributes,
  MutableRefObject,
  useRef,
  useState,
} from "react";
import "./App.css";

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnTXIs1uy3sS6W8CO1sD_YINnM6w_nJS4",
  authDomain: "msg-chat-app-47f2c.firebaseapp.com",
  projectId: "msg-chat-app-47f2c",
  storageBucket: "msg-chat-app-47f2c.appspot.com",
  messagingSenderId: "961057036272",
  appId: "1:961057036272:web:f4e0c633c3e1680c82ef35",
  measurementId: "G-77M4TVYMWC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

const SignIn = () => {
  const signInwithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div>
      <button onClick={signInwithGoogle}>Sign In</button>
    </div>
  );
};

const ChatRoom = () => {
  const [msg, setMsg] = useState("");
  const docRef = collection(db, "message");
  const q = query(docRef, orderBy("createdAt", "asc"), limit(500));
  const scroll = useRef<HTMLInputElement>(null);

  const [messages] = useCollectionData(q);

  const msgSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const { uid, photoURL }: User = auth.currentUser!;
    await addDoc(docRef, {
      text: msg,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setMsg("");
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div>
      <main>
        {messages &&
          messages.map((value, i) => <Message key={i} msg={value} />)}
        <div ref={scroll}></div>
      </main>

      <form onSubmit={msgSend}>
        <input
          type="text"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">💬</button>
      </form>
    </div>
  );
};

const Message = (props: any) => {
  const { photoURL, text, uid } = props.msg;
  const random = Math.round(Math.random() * 100);

  const messageClass = uid === auth.currentUser?.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={
          photoURL ||
          `https://avatars.dicebear.com/api/open-peeps/${random}.svg`
        }
        alt={auth.currentUser?.displayName as string}
      />
      <p>{text}</p>
    </div>
  );
};

export default App;
