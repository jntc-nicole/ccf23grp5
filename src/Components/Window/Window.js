import './Window.css';

function Window(props) {
  let msgs = null;
  msgs = props.msgs.map((msg) => {
    if (!msg) {
      return null
    }
    return (
    <div>
      <h3 className='h3'>{msg.sender + " at " + msg.time}</h3>
      <p className='p'>{msg.msg}</p>
    </div>
    );
  });
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