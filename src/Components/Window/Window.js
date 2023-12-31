import './Window.css';

function Window(props) {
  let msgs = null;
  msgs = props.msgs.map((msg) => {
    if (!msg) {
      return null
    }
    return (
    <div>
      <h5>{msg.sender + " " + msg.time}</h5>
      <p>{msg.msg}</p>
    </div>
    );
  });
  return (
    <div className='window'>
      <div>
        <h1>{props.currentgrp}</h1>
        <div className='overflow'>
          {msgs}
        </div>
      </div>
      <div className='sendbox'>
        <textarea id="newmsg"></textarea>
        <input type="button" value={"Send\nMessage"} onClick={
          () => {
            const newmsg = document.getElementById("newmsg").value;
            props.post(props.currentgrp,newmsg);
          }
        } />
      </div>
    </div>
  );
}

export default Window;