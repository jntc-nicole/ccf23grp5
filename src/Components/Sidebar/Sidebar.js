import './Sidebar.css';

function Sidebar(props) {
  var grps = props.grps.map((grp) => {
    return (
      <input className="grpitm bigger" type="button" value={grp} onClick={() => {props.changegrp(grp)}} />
    );
  })
  return (
    <div className='sidebar'>
      <h1 className='h1'>{props.myusername + "'s Groups:"}</h1>
      <div className='overflow'>
        {grps}
      </div>
      <div className='addgrp'>
        <h2 className='addme h2'>New Group:</h2>
        <input type='text' id="newgrpname" className='addme' />
        <input type="button" value="Add group" className='addme' onClick={
          () => {
            const newgrp = document.getElementById("newgrpname").value;
            props.addgrp(newgrp);
          }
        } />
        <input type="button" value="I'm feeling lucky!" className='addme' onClick={props.lucky} />
      </div>
    </div>
  );
}

export default Sidebar;