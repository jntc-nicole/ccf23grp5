import './Window.css';

function Window(props) {
  // formatting of messages
  let msgs = null;
  msgs = props.msgs.map((msg) => {
    if (!msg) {
      return null
    }
    return (
    <div>
      <h3 className='h3'>{msg.sender + " at " + msg.time}</h3>
      <div className='p'>{msg.msg}</div>
    </div>
    );
  });
  // head shows currently selected group and logout button
  // messages are shown below that
  // text input and post button are in the sendbox
  return (
    <div className='window'>
      <div>
        <div className='head'>
          <h1 className='h1'>{props.currentgrp}</h1>
          <input value="Logout" type="button" onClick={props.logout} />
        </div>
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