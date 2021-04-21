import React, { useRef, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import "./App.css";
import {
  Button,
  Container,
  Row,
  Col,
  Navbar,
  NavbarText,
  InputGroup,
  Input,
  InputGroupAddon,
  Toast,
  ToastHeader,
  ToastBody,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
firebase.initializeApp({
  //firebase config
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <Container style={{backgroundColor: '#a2c9cf'}} >
      <Row>
        <Col xs="12">
          <header className="shadow-lg p-3 mb-5 bg-body rounded" style={{backgroundColor: '#a2c9cf'}}>
            <h1 className=" text-center">Cesummit'21</h1>
            <SignOut />
          </header>

          <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </Col>
      </Row>
    </Container>
  );
}
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <div className="text-center">
      <Button color="secondary" onClick={signInWithGoogle}>
        {" "}
        Sign In With Google{" "}
      </Button>
    </div>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <Container>
        <Row>
          <Col xs="9">
            <Navbar color="light" light expand="md" className="mx-auto" style={{borderRadius: "10px"}}>
              <NavbarText >
                Hoşgeldiniz {auth.currentUser.displayName}{" "}
              </NavbarText>
            </Navbar>
          </Col>
          <Col xs="3">
            <Button
              color="dark"
              className="position-absolute top-0 start-100 translate-middle"
              // style={{float:"-moz-initial"}}
              onClick={() => auth.signOut()}
            >
              Çıkış Yap
            </Button>
          </Col>
        </Row>
      </Container>
    )
  );
}
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limitToLast(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>

      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <InputGroup>
          <Input
            placeholder="Mesajınızı Giriniz"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <InputGroupAddon addonType="append">
            <Button type="submit" color="secondary">
              Gönder
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, photoURL, displayName, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "right" : "left";
  const messageColor = uid === auth.currentUser.uid ? "#a2cfa8" : "#a5a2cf";
  return (
    <>
      <img alt=""></img>
      <div >
        <ListGroup>
          <ListGroupItem style={{border:"none", backgroundColor: '#a2c9cf'}}>
            <div style={{ float: `${messageClass}`}}>
              <Toast style={{backgroundColor: `${messageColor}`, borderRadius: "10px", border:"none"}}>
                <ToastHeader style={{backgroundColor: `${messageColor}`, border: "none"}}>
                  <img src={photoURL} alt="img" width="50px" height="50px" style={{borderRadius: "50%"}} />
                  &nbsp;{displayName}
                </ToastHeader>
                <ToastBody style={{textAlign: "center"}}>{text}</ToastBody>
              </Toast>
            </div>
          </ListGroupItem>
        </ListGroup>
      </div>
    </>
  );
}
export default App;
